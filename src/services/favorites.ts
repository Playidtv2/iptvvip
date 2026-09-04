import { FavoriteItem } from '../types';

const STORAGE_FAVORITES_KEY = 'playid_favorites_v1';

export function determineItemKind(item: any, explicitKind?: 'live' | 'vod' | 'series'): 'live' | 'vod' | 'series' {
  if (explicitKind) return explicitKind;
  if (item.kind === 'live' || item.kind === 'vod' || item.kind === 'series') return item.kind;
  if (item.series_id !== undefined) return 'series';
  if (item.container_extension !== undefined || item.stream_type === 'movie') return 'vod';
  if (item.tv_archive !== undefined || item.stream_type === 'live') return 'live';
  // Default check
  if (item.stream_id && !item.series_id) {
    if (item.container_extension) return 'vod';
    return 'live';
  }
  return 'live';
}

export function getItemId(item: any): string | number {
  return item.stream_id ?? item.series_id ?? item.id ?? '';
}

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read favorites from localStorage', err);
    return [];
  }
}

export function saveFavorites(items: FavoriteItem[]): void {
  try {
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('playid-favorites-changed', { detail: items }));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
}

export function isFavorite(id: string | number, kind?: 'live' | 'vod' | 'series'): boolean {
  if (!id) return false;
  const current = getFavorites();
  const targetId = String(id);
  return current.some((fav) => {
    const matchesId = String(fav.id) === targetId;
    return kind ? matchesId && fav.kind === kind : matchesId;
  });
}

export function addFavorite(rawItem: any, explicitKind?: 'live' | 'vod' | 'series'): FavoriteItem {
  const kind = determineItemKind(rawItem, explicitKind);
  const id = getItemId(rawItem);
  const name = rawItem.name || rawItem.title || 'Untitled';
  const cover = rawItem.cover || rawItem.stream_icon || rawItem.movie_image;
  const stream_icon = rawItem.stream_icon || rawItem.cover;

  const newFav: FavoriteItem = {
    id,
    name,
    cover,
    stream_icon,
    kind,
    category_id: rawItem.category_id,
    category_name: rawItem.category_name,
    rating: rawItem.rating,
    year: rawItem.year || rawItem.releaseDate,
    genre: rawItem.genre,
    container_extension: rawItem.container_extension,
    stream_type: rawItem.stream_type,
    addedAt: Date.now(),
    rawItem,
  };

  const current = getFavorites();
  // Filter out any existing matching item to move it to the front
  const filtered = current.filter((x) => !(String(x.id) === String(id) && x.kind === kind));
  const updated = [newFav, ...filtered];
  saveFavorites(updated);
  return newFav;
}

export function removeFavorite(id: string | number, kind?: 'live' | 'vod' | 'series'): void {
  const current = getFavorites();
  const targetId = String(id);
  const updated = current.filter((x) => {
    const matchesId = String(x.id) === targetId;
    return kind ? !(matchesId && x.kind === kind) : !matchesId;
  });
  saveFavorites(updated);
}

export function toggleFavorite(rawItem: any, explicitKind?: 'live' | 'vod' | 'series'): boolean {
  const kind = determineItemKind(rawItem, explicitKind);
  const id = getItemId(rawItem);
  if (isFavorite(id, kind)) {
    removeFavorite(id, kind);
    return false;
  } else {
    addFavorite(rawItem, kind);
    return true;
  }
}

export function clearFavorites(): void {
  saveFavorites([]);
}
