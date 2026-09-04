import React, { useState, useMemo } from 'react';
import { Tv, Film, Clapperboard, Play, Star, Sparkles, X, ChevronRight, Search, ShieldAlert } from 'lucide-react';
import { LiveStream, VodStream, SeriesItem } from '../types';
import { getProxiedImageUrl, isAdultContent } from '../services/xtreamApi';

interface GlobalSearchResultsProps {
  query: string;
  onClearQuery: () => void;
  liveItems: LiveStream[];
  vodItems: VodStream[];
  seriesItems: SeriesItem[];
  onSelectItem: (item: any, kind: 'live' | 'vod' | 'series') => void;
  showAdult: boolean;
  isLoading?: boolean;
}

type TabType = 'all' | 'live' | 'vod' | 'series';

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  query,
  onClearQuery,
  liveItems,
  vodItems,
  seriesItems,
  onSelectItem,
  showAdult,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const cleanQuery = query.trim().toLowerCase();

  const filteredLive = useMemo(() => {
    if (!cleanQuery) return [];
    return liveItems.filter((it) => {
      if (!showAdult && isAdultContent(it.name)) return false;
      return it.name.toLowerCase().includes(cleanQuery);
    });
  }, [liveItems, cleanQuery, showAdult]);

  const filteredVod = useMemo(() => {
    if (!cleanQuery) return [];
    return vodItems.filter((it) => {
      if (!showAdult && isAdultContent(it.name)) return false;
      return it.name.toLowerCase().includes(cleanQuery);
    });
  }, [vodItems, cleanQuery, showAdult]);

  const filteredSeries = useMemo(() => {
    if (!cleanQuery) return [];
    return seriesItems.filter((it) => {
      if (!showAdult && isAdultContent(it.name)) return false;
      return it.name.toLowerCase().includes(cleanQuery);
    });
  }, [seriesItems, cleanQuery, showAdult]);

  const totalResults = filteredLive.length + filteredVod.length + filteredSeries.length;

  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 select-none animate-in fade-in duration-200">
      {/* Search Header Banner */}
      <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-5 sm:p-6 mb-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
                <Search className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                ผลการค้นหาทั่วระบบ (Global Search)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              "{query}"
              <span className="text-sm font-semibold text-slate-400 ml-2">
                (พบทั้งหมด {totalResults} รายการ)
              </span>
            </h2>
          </div>

          <button
            onClick={onClearQuery}
            className="self-start sm:self-center px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/5 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>ล้างคำค้นหา / ปิดการค้นหา</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ทั้งหมด ({totalResults})</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>ทีวีถ่ายทอดสด ({filteredLive.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vod')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vod'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>ภาพยนตร์ VOD ({filteredVod.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'series'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>ซีรีส์ ({filteredSeries.length})</span>
          </button>
        </div>
      </div>

      {/* Main Results Container */}
      {totalResults === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
            <Search className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">ไม่พบรายการที่ตรงกับ "{query}"</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
            ลองตรวจสอบตัวสะกด หรือใช้คำค้นหาที่สั้นลง เช่น ชื่อรายการ, ทีมฟุตบอล, หรือนักแสดง
          </p>
          <button
            onClick={onClearQuery}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            ล้างการค้นหาและดูรายการทั้งหมด
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: LIVE TV */}
          {(activeTab === 'all' || activeTab === 'live') && filteredLive.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-pink-400" />
                    <span>ช่องทีวีถ่ายทอดสด (Live TV)</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {filteredLive.length} ช่อง
                    </span>
                  </h3>
                </div>

                {activeTab === 'all' && filteredLive.length > 8 && (
                  <button
                    onClick={() => setActiveTab('live')}
                    className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                  >
                    <span>ดูทั้งหมด ({filteredLive.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {(activeTab === 'all' ? filteredLive.slice(0, 12) : filteredLive).map((item) => (
                  <div
                    key={item.stream_id}
                    onClick={() => onSelectItem(item, 'live')}
                    className="group relative bg-slate-900/70 hover:bg-slate-800 border border-white/5 hover:border-pink-500/50 rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10"
                  >
                    <div className="relative w-full aspect-video rounded-xl bg-slate-950 flex items-center justify-center p-2 mb-2.5 overflow-hidden border border-white/5">
                      {item.stream_icon ? (
                        <img
                          src={getProxiedImageUrl(item.stream_icon)}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Tv className="w-8 h-8 text-slate-600" />
                      )}

                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-pink-600 text-white font-extrabold text-[9px] uppercase tracking-wider shadow">
                        LIVE
                      </span>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-600/40">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: VOD MOVIES */}
          {(activeTab === 'all' || activeTab === 'vod') && filteredVod.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>ภาพยนตร์ (Movies VOD)</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {filteredVod.length} เรื่อง
                    </span>
                  </h3>
                </div>

                {activeTab === 'all' && filteredVod.length > 8 && (
                  <button
                    onClick={() => setActiveTab('vod')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <span>ดูทั้งหมด ({filteredVod.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {(activeTab === 'all' ? filteredVod.slice(0, 12) : filteredVod).map((item) => (
                  <div
                    key={item.stream_id}
                    onClick={() => onSelectItem(item, 'vod')}
                    className="group relative bg-slate-900/70 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
                  >
                    <div className="relative aspect-[2/3] bg-slate-950 overflow-hidden">
                      {item.stream_icon ? (
                        <img
                          src={getProxiedImageUrl(item.stream_icon)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}

                      {item.rating && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-current" /> {item.rating}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      {item.year && (
                        <span className="text-[10px] text-slate-400 mt-1 font-semibold block">
                          {String(item.year).substring(0, 4)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: TV SERIES */}
          {(activeTab === 'all' || activeTab === 'series') && filteredSeries.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-purple-400" />
                    <span>ซีรีส์ (TV Series)</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {filteredSeries.length} เรื่อง
                    </span>
                  </h3>
                </div>

                {activeTab === 'all' && filteredSeries.length > 8 && (
                  <button
                    onClick={() => setActiveTab('series')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>ดูทั้งหมด ({filteredSeries.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {(activeTab === 'all' ? filteredSeries.slice(0, 12) : filteredSeries).map((item) => (
                  <div
                    key={item.series_id}
                    onClick={() => onSelectItem(item, 'series')}
                    className="group relative bg-slate-900/70 hover:bg-slate-800 border border-white/5 hover:border-purple-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
                  >
                    <div className="relative aspect-[2/3] bg-slate-950 overflow-hidden">
                      {item.cover ? (
                        <img
                          src={getProxiedImageUrl(item.cover)}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Clapperboard className="w-8 h-8" />
                        </div>
                      )}

                      {item.rating && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-current" /> {item.rating}
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30">
                          เลือกตอน
                        </div>
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      {item.genre && (
                        <span className="text-[10px] text-slate-400 mt-1 font-semibold block truncate">
                          {item.genre}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
