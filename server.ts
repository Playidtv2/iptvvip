import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for API routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Xtream Player API Proxy
app.get('/api/xtream/data', async (req: Request, res: Response) => {
  try {
    const { serverUrl, username, password, action, ...extraParams } = req.query;
    if (!serverUrl || !username || !password) {
      return res.status(400).json({ error: 'Missing required parameters: serverUrl, username, password' });
    }

    const cleanBaseUrl = String(serverUrl).replace(/\/+$/, '');
    const url = new URL(`${cleanBaseUrl}/player_api.php`);
    url.searchParams.set('username', String(username));
    url.searchParams.set('password', String(password));
    if (action) {
      url.searchParams.set('action', String(action));
    }
    for (const [key, val] of Object.entries(extraParams)) {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const upstreamRes = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'IPTVSmarters/1.0.0 (Linux; Android 10)',
      },
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream HTTP ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error('Error fetching Xtream data:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch Xtream data' });
  }
});

// Stream & M3U8 Proxy (Solves Mixed Content and CORS)
app.get('/api/stream/proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    const finalUrl = upstreamRes.url || targetUrl;

    const isM3U8 =
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl') ||
      targetUrl.includes('.m3u8');

    if (isM3U8) {
      const text = await upstreamRes.text();
      // Rewrite M3U8 playlist segment URIs
      const lines = text.split('\n');
      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Rewrite segment/sub-playlist lines
        if (!trimmed.startsWith('#')) {
          try {
            const absoluteUrl = new URL(trimmed, finalUrl).href;
            return `/api/stream/proxy?url=${encodeURIComponent(absoluteUrl)}`;
          } catch {
            return line;
          }
        }

        // Handle URI inside tags like #EXT-X-KEY:METHOD=...,URI="key.key"
        if (trimmed.includes('URI="')) {
          return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
            try {
              const absoluteUrl = new URL(uri, finalUrl).href;
              return `URI="/api/stream/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            } catch {
              return match;
            }
          });
        }

        return line;
      });

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(rewrittenLines.join('\n'));
    }

    // Binary Stream (TS segment, MP4, MKV, etc.)
    res.status(upstreamRes.status);
    if (upstreamRes.headers.get('content-type')) {
      res.setHeader('Content-Type', upstreamRes.headers.get('content-type')!);
    }
    if (upstreamRes.headers.get('content-length')) {
      res.setHeader('Content-Length', upstreamRes.headers.get('content-length')!);
    }
    if (upstreamRes.headers.get('content-range')) {
      res.setHeader('Content-Range', upstreamRes.headers.get('content-range')!);
    }
    if (upstreamRes.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', upstreamRes.headers.get('accept-ranges')!);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!upstreamRes.body) {
      return res.end();
    }

    // Convert Web ReadableStream to Node response stream
    const reader = upstreamRes.body.getReader();
    req.on('close', () => {
      reader.cancel().catch(() => {});
    });

    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const ok = res.write(Buffer.from(value));
          if (!ok) {
            await new Promise((resolve) => res.once('drain', resolve));
          }
        }
        res.end();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Stream piping error:', err?.message || err);
        }
        res.end();
      }
    };
    pump();
  } catch (err: any) {
    console.error('Error proxying stream:', err?.message || err);
    if (!res.headersSent) {
      res.status(502).send('Error proxying stream');
    }
  }
});

// Image Proxy (Avoid mixed content on channel icons and posters)
app.get('/api/stream/image', async (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const upstreamRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Image fetch failed');
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch {
    return res.status(502).send('Error fetching image');
  }
});

// M3U Playlist Exporter
app.get('/api/xtream/m3u', async (req: Request, res: Response) => {
  const { serverUrl, username, password, type = 'm3u_plus' } = req.query;
  if (!serverUrl || !username || !password) {
    return res.status(400).send('Missing required parameters');
  }

  const cleanBaseUrl = String(serverUrl).replace(/\/+$/, '');
  const url = `${cleanBaseUrl}/get.php?username=${encodeURIComponent(String(username))}&password=${encodeURIComponent(String(password))}&type=${type}`;

  try {
    const upstreamRes = await fetch(url);
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Failed to fetch M3U');
    }

    const playlistText = await upstreamRes.text();
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', `attachment; filename="playid_iptv_${username}.m3u"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(playlistText);
  } catch (err: any) {
    return res.status(500).send('Error generating M3U: ' + err?.message);
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
