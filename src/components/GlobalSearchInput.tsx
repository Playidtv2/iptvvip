import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Film, Tv, Clapperboard, Play, Loader2, ArrowRight, Star, Sparkles } from 'lucide-react';
import { LiveStream, VodStream, SeriesItem } from '../types';
import { getProxiedImageUrl, isAdultContent } from '../services/xtreamApi';

interface GlobalSearchInputProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClear: () => void;
  liveItems: LiveStream[];
  vodItems: VodStream[];
  seriesItems: SeriesItem[];
  onSelectItem: (item: any, kind: 'live' | 'vod' | 'series') => void;
  onViewAll: () => void;
  isLoading?: boolean;
  showAdult: boolean;
}

export const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  query,
  onQueryChange,
  onClear,
  liveItems,
  vodItems,
  seriesItems,
  onSelectItem,
  onViewAll,
  isLoading = false,
  showAdult,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: '/' or 'Cmd+K' to focus search, 'Esc' to clear/blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const cleanQuery = query.trim().toLowerCase();

  // Filter items
  const matchedLive = useMemo(() => {
    if (!cleanQuery) return [];
    return liveItems
      .filter((it) => {
        if (!showAdult && isAdultContent(it.name)) return false;
        return it.name.toLowerCase().includes(cleanQuery);
      })
      .slice(0, 4);
  }, [liveItems, cleanQuery, showAdult]);

  const matchedVod = useMemo(() => {
    if (!cleanQuery) return [];
    return vodItems
      .filter((it) => {
        if (!showAdult && isAdultContent(it.name)) return false;
        return it.name.toLowerCase().includes(cleanQuery);
      })
      .slice(0, 4);
  }, [vodItems, cleanQuery, showAdult]);

  const matchedSeries = useMemo(() => {
    if (!cleanQuery) return [];
    return seriesItems
      .filter((it) => {
        if (!showAdult && isAdultContent(it.name)) return false;
        return it.name.toLowerCase().includes(cleanQuery);
      })
      .slice(0, 4);
  }, [seriesItems, cleanQuery, showAdult]);

  const totalMatchesCount = useMemo(() => {
    if (!cleanQuery) return 0;
    const countL = liveItems.filter((it) => (!showAdult && isAdultContent(it.name) ? false : it.name.toLowerCase().includes(cleanQuery))).length;
    const countV = vodItems.filter((it) => (!showAdult && isAdultContent(it.name) ? false : it.name.toLowerCase().includes(cleanQuery))).length;
    const countS = seriesItems.filter((it) => (!showAdult && isAdultContent(it.name) ? false : it.name.toLowerCase().includes(cleanQuery))).length;
    return countL + countV + countS;
  }, [cleanQuery, liveItems, vodItems, seriesItems, showAdult]);

  const showDropdown = isFocused && cleanQuery.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-2 sm:mx-4">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsFocused(false);
              onViewAll();
            }
          }}
          placeholder="ค้นหาช่องสด, หนัง VOD, ซีรีส์..."
          className="w-full bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-white/10 hover:border-white/20 focus:border-indigo-500/80 rounded-full pl-10 pr-16 py-2 text-xs sm:text-sm text-white placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
              className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="ล้างคำค้นหา"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-white/10 rounded-md shadow-sm">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete / Instant Dropdown Preview */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] flex flex-col">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>ผลการค้นหาด่วนสำหรับ "{query}"</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              พบ {totalMatchesCount} รายการ
            </span>
          </div>

          {/* Results Scroll Area */}
          <div className="overflow-y-auto p-2 divide-y divide-white/5 space-y-2">
            {totalMatchesCount === 0 ? (
              <div className="py-8 text-center px-4">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-300">ไม่พบข้อมูลที่ตรงกับ "{query}"</p>
                <p className="text-[11px] text-slate-500 mt-1">ลองค้นหาด้วยคำอื่น เช่น ชื่อช่อง, ชื่อหนัง, หรือซีรีส์</p>
              </div>
            ) : (
              <>
                {/* Live Section */}
                {matchedLive.length > 0 && (
                  <div className="pt-1 first:pt-0">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-pink-400">
                        <Tv className="w-3.5 h-3.5" /> ช่องทีวีสด ({matchedLive.length})
                      </span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedLive.map((item) => (
                        <div
                          key={item.stream_id}
                          onClick={() => {
                            setIsFocused(false);
                            onSelectItem(item, 'live');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                              {item.stream_icon ? (
                                <img
                                  src={getProxiedImageUrl(item.stream_icon)}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-0.5"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Tv className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {item.name}
                            </span>
                          </div>
                          <button className="px-2.5 py-1 rounded-full bg-pink-600/80 hover:bg-pink-500 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-2.5 h-2.5 fill-current" /> ดูสด
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VOD Section */}
                {matchedVod.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <Film className="w-3.5 h-3.5" /> ภาพยนตร์ VOD ({matchedVod.length})
                      </span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedVod.map((item) => (
                        <div
                          key={item.stream_id}
                          onClick={() => {
                            setIsFocused(false);
                            onSelectItem(item, 'vod');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-10 rounded-lg bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                              {item.stream_icon ? (
                                <img
                                  src={getProxiedImageUrl(item.stream_icon)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Film className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate block">
                                {item.name}
                              </span>
                              {item.rating && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                                  <Star className="w-2.5 h-2.5 fill-current" /> {item.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="px-2.5 py-1 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-2.5 h-2.5 fill-current" /> รับชม
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Series Section */}
                {matchedSeries.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-purple-400">
                        <Clapperboard className="w-3.5 h-3.5" /> ซีรีส์ ({matchedSeries.length})
                      </span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {matchedSeries.map((item) => (
                        <div
                          key={item.series_id}
                          onClick={() => {
                            setIsFocused(false);
                            onSelectItem(item, 'series');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-10 rounded-lg bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                              {item.cover ? (
                                <img
                                  src={getProxiedImageUrl(item.cover)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Clapperboard className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate block">
                                {item.name}
                              </span>
                              {item.genre && (
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {item.genre}
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="px-2.5 py-1 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            เลือกตอน
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer View All Bar */}
          {totalMatchesCount > 0 && (
            <div className="p-2.5 bg-slate-950 border-t border-white/5 text-center">
              <button
                onClick={() => {
                  setIsFocused(false);
                  onViewAll();
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
              >
                <span>ดูผลการค้นหาทั้งหมด ({totalMatchesCount} รายการ)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
