import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { LiveStream, SeriesItem, VodStream } from '../types';
import { getProxiedImageUrl } from '../services/xtreamApi';

interface HeroSliderProps {
  items: (LiveStream | VodStream | SeriesItem)[];
  type: 'live' | 'vod' | 'series';
  onSelectItem: (item: any) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ items, type, onSelectItem }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getBadgeLabel = () => {
    if (type === 'live') return 'ถ่ายทอดสด';
    if (type === 'vod') return 'ภาพยนตร์ยอดนิยม';
    return 'ซีรีส์แนะนำ';
  };

  const getBadgeBg = () => {
    if (type === 'live') return 'bg-red-500';
    if (type === 'vod') return 'bg-gradient-to-r from-indigo-500 to-pink-500';
    return 'bg-indigo-600';
  };

  return (
    <div className="relative w-full py-4 px-4 sm:px-6 bg-gradient-to-b from-slate-900 via-slate-900/40 to-transparent border-b border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            {type === 'live' ? 'ช่องรายการเด่น & กีฬายอดนิยม' : 'รายการแนะนำพิเศษ'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-white/10 transition-colors shadow"
            title="ก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-white/10 transition-colors shadow"
            title="ถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 overflow-x-auto scrollbar-none scroll-smooth pb-2"
      >
        {items.slice(0, 16).map((item, idx) => {
          const rawItem = item as any;
          const title = rawItem.name || rawItem.title || 'ไม่มีชื่อรายการ';
          const icon = rawItem.stream_icon || rawItem.cover || '';
          const proxiedIcon = getProxiedImageUrl(icon);
          const isLive = type === 'live';

          return (
            <div
              key={idx}
              onClick={() => onSelectItem(item)}
              className="group relative flex-shrink-0 w-64 sm:w-72 aspect-video rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border border-white/5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-200"
            >
              {/* Background Image / Logo */}
              <div className="w-full h-full flex items-center justify-center bg-indigo-950/20 p-2">
                {proxiedIcon ? (
                  <img
                    src={proxiedIcon}
                    alt={title}
                    loading="lazy"
                    className={`w-full h-full ${
                      isLive ? 'object-contain p-4' : 'object-cover group-hover:scale-105'
                    } transition-transform duration-300`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                ) : (
                  <div className="text-white/20 font-black italic tracking-tight text-xl uppercase">{title.slice(0, 12)}</div>
                )}
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider uppercase shadow-sm ${getBadgeBg()}`}
                  >
                    {getBadgeLabel()}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 group-hover:scale-110 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors drop-shadow">
                  {title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
