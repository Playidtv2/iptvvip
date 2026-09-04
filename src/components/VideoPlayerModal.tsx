import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  X,
  Maximize,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Play,
  AlertTriangle,
  Film,
  Layers,
} from 'lucide-react';
import { AuthSession, Episode } from '../types';
import {
  buildStreamUrl,
  getProxiedUrl,
  updateWatchProgress,
  upsertWatchHistory,
} from '../services/xtreamApi';

interface VideoPlayerModalProps {
  session: AuthSession;
  item: {
    id: string | number;
    name: string;
    cover?: string;
    kind: 'live' | 'vod' | 'series';
    ext?: string;
    resumeTime?: number;
    episodes?: Episode[];
    currentEpIndex?: number;
  };
  onClose: () => void;
  onSelectEpisode?: (index: number) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  session,
  item,
  onClose,
  onSelectEpisode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [streamUrl, setStreamUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoNext, setAutoNext] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [pendingResumeTime, setPendingResumeTime] = useState(0);

  const episodes = item.episodes || [];
  const currentEp = episodes[item.currentEpIndex ?? 0];
  const isSeries = item.kind === 'series' && episodes.length > 0;

  // Determine title
  const displayTitle = isSeries && currentEp
    ? `${item.name} • ${currentEp.title || `ตอนที่ ${currentEp.episode_num}`}`
    : item.name;

  // Construct target stream URL
  useEffect(() => {
    let rawUrl = '';
    if (isSeries && currentEp) {
      rawUrl = buildStreamUrl(
        session,
        'series',
        currentEp.id,
        currentEp.container_extension || 'mp4'
      );
    } else if (item.kind === 'live') {
      rawUrl = buildStreamUrl(session, 'live', item.id, 'm3u8');
    } else {
      rawUrl = buildStreamUrl(session, 'vod', item.id, item.ext || 'mp4');
    }

    setStreamUrl(rawUrl);

    // Check if resume time is present
    if (item.resumeTime && item.resumeTime > 10 && item.kind !== 'live') {
      setPendingResumeTime(item.resumeTime);
      setShowResumePrompt(true);
    } else {
      startPlayback(rawUrl, 0);
    }

    // Record initial history
    upsertWatchHistory({
      id: item.id,
      name: item.name,
      cover: item.cover,
      kind: item.kind,
      pos: 0,
      epIndex: item.currentEpIndex,
      epTitle: currentEp?.title,
      ext: item.ext,
    });

    return () => {
      destroyPlayer();
    };
  }, [item.id, item.currentEpIndex]);

  const destroyPlayer = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const startPlayback = (url: string, seekTime: number = 0) => {
    setErrorMsg(null);
    destroyPlayer();

    const video = videoRef.current;
    if (!video) return;

    // Route through our secure proxy
    const proxied = getProxiedUrl(url);
    const isHls = url.includes('.m3u8') || item.kind === 'live';

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;
      hls.loadSource(proxied);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (seekTime > 0) {
          video.currentTime = seekTime;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('ไม่สามารถเล่นสตรีมผ่านเบราว์เซอร์ได้ (กรุณากดเปิดใน VLC ด้านล่าง)');
              destroyPlayer();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari Native HLS
      video.src = proxied;
      video.onloadedmetadata = () => {
        if (seekTime > 0) {
          video.currentTime = seekTime;
        }
        video.play().catch(() => {});
      };
      video.onerror = () => {
        setErrorMsg('เบราว์เซอร์ไม่รองรับรูปแบบวิดีโอนี้ แนะนำให้เปิดใน VLC');
      };
    } else {
      // Standard MP4 / WebM / MKV
      video.src = proxied;
      video.onloadedmetadata = () => {
        if (seekTime > 0) {
          video.currentTime = seekTime;
        }
        video.play().catch(() => {});
      };
      video.onerror = () => {
        setErrorMsg('เบราว์เซอร์ไม่รองรับถอดรหัสไฟล์นี้ (MKV/AC3) กรุณาใช้ปุ่มเปิดใน VLC');
      };
    }
  };

  // Periodic watch progress save
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.currentTime || item.kind === 'live') return;
    updateWatchProgress(
      item.id,
      item.kind,
      Math.floor(video.currentTime),
      Math.floor(video.duration || 0),
      item.currentEpIndex
    );
  };

  // Auto-play next episode
  const handleEnded = () => {
    if (isSeries && autoNext && onSelectEpisode && item.currentEpIndex !== undefined) {
      if (item.currentEpIndex + 1 < episodes.length) {
        onSelectEpisode(item.currentEpIndex + 1);
      }
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      video.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Copy Stream URL
  const copyStreamUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open in VLC / External Player
  const openInVLC = () => {
    if (!streamUrl) return;
    const ua = navigator.userAgent.toLowerCase();

    if (/android/.test(ua)) {
      const clean = streamUrl.replace(/^https?:\/\//i, '');
      window.location.href = `intent://${clean}#Intent;package=org.videolan.vlc;type=video/*;scheme=http;end`;
      return;
    }
    if (/iphone|ipad|ipod/.test(ua)) {
      window.location.href = `vlc://${streamUrl}`;
      return;
    }

    // Windows / Mac / Desktop: download .m3u playlist file that opens in VLC
    const m3uContent = `#EXTM3U\n#EXTINF:-1,${displayTitle}\n${streamUrl}\n`;
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${displayTitle.replace(/[/\\?%*:|"<>]/g, '_')}.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="videoPlayerModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-fade-in"
    >
      {/* Resume Playback Prompt Box */}
      {showResumePrompt && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">รับชมค้างไว้</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              คุณมีประวัติการรับชมเรื่องนี้ค้างไว้ที่{' '}
              <strong className="text-indigo-400 font-bold">
                {Math.floor(pendingResumeTime / 60)} นาที {Math.floor(pendingResumeTime % 60)} วินาที
              </strong>
              <br />
              ต้องการรับชมต่อจากเดิมหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResumePrompt(false);
                  startPlayback(streamUrl, pendingResumeTime);
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                ▶ ดูต่อจากเดิม
              </button>
              <button
                onClick={() => {
                  setShowResumePrompt(false);
                  startPlayback(streamUrl, 0);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-white/5"
              >
                🔄 เริ่มต้นใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white truncate drop-shadow">
              {displayTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 border border-white/5"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player & Drawer Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-black">
          {/* Video Section */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[420px] bg-black">
            <video
              ref={videoRef}
              controls
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="w-full h-full max-h-[70vh] object-contain bg-black"
            />

            {/* Error Message Overlay */}
            {errorMsg && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20">
                <AlertTriangle className="w-12 h-12 text-pink-500 mb-3" />
                <h4 className="text-base font-bold text-white mb-1">ไม่สามารถเล่นวิดีโอนี้ในเบราว์เซอร์</h4>
                <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">{errorMsg}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={openInVLC}
                    className="px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>เปิดด้วย VLC ทันที</span>
                  </button>
                  <button
                    onClick={() => startPlayback(streamUrl, 0)}
                    className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ลองโหลดใหม่</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Series Episodes Drawer (if Series) */}
          {isSeries && (
            <div className="w-full lg:w-72 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col max-h-56 lg:max-h-none overflow-hidden">
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> รายชื่อตอน ({episodes.length})
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNext}
                    onChange={(e) => setAutoNext(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-800 border-white/10 text-indigo-600"
                  />
                  เล่นตอนถัดไป
                </label>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {episodes.map((ep, idx) => {
                  const isActive = idx === item.currentEpIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectEpisode && onSelectEpisode(idx)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold shadow-md shadow-indigo-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{ep.title || `ตอนที่ ${ep.episode_num}`}</span>
                      {isActive && <Play className="w-3 h-3 fill-current shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            {/* Open in VLC */}
            <button
              onClick={openInVLC}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20"
              title="เปิดในแอป VLC (Android/iOS/PC)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>🎬 เปิดใน VLC</span>
            </button>

            {/* Copy Stream Link */}
            <button
              onClick={copyStreamUrl}
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
              title="คัดลอกลิงก์สตรีมโดยตรง"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
              title="เต็มจอ"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>เต็มจอ</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <Film className="w-3.5 h-3.5 text-indigo-400" />
            <span>สตรีมความเร็วสูง Xtream Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
};
