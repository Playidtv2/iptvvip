import React, { useEffect, useState } from 'react';
import { X, Play, Star, Calendar, Tag, Sparkles } from 'lucide-react';
import { AuthSession } from '../types';
import { fetchSeriesDetail, fetchVodDetail, getProxiedImageUrl } from '../services/xtreamApi';

interface InfoModalProps {
  session: AuthSession;
  item: any;
  onClose: () => void;
  onPlay: (item: any) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ session, item, onClose, onPlay }) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<{
    plot?: string;
    rating?: string | number;
    year?: string;
    genre?: string;
    cover?: string;
    episodesCount?: number;
  }>({});

  const title = item.name || item.title || '-';
  const isSeries = Boolean(item.series_id || item.kind === 'series');
  const isVod = !isSeries && Boolean(item.container_extension || item.stream_id || item.kind === 'vod');

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        if (isVod && item.stream_id) {
          const res = await fetchVodDetail(session, item.stream_id);
          if (isMounted && res.info) {
            setDetails({
              plot: res.info.plot,
              rating: res.info.rating,
              year: res.info.year || res.info.releaseDate,
              genre: res.info.genre,
              cover: res.info.movie_image,
            });
          }
        } else if (isSeries && item.series_id) {
          const res = await fetchSeriesDetail(session, item.series_id);
          if (isMounted && res.info) {
            let totalEps = 0;
            if (res.episodes) {
              Object.values(res.episodes).forEach((eps) => {
                totalEps += eps.length;
              });
            }
            setDetails({
              plot: res.info.plot,
              rating: res.info.rating,
              year: res.info.releaseDate,
              genre: res.info.genre,
              cover: res.info.cover,
              episodesCount: totalEps,
            });
          }
        }
      } catch {
        // Use default fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [item.stream_id, item.series_id]);

  const displayCover = getProxiedImageUrl(details.cover || item.stream_icon || item.cover);

  return (
    <div
      id="infoModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Poster Image */}
        <div className="w-full md:w-56 aspect-[2/3] shrink-0 bg-slate-950 relative flex items-center justify-center">
          {displayCover ? (
            <img
              src={displayCover}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.visibility = 'hidden';
              }}
            />
          ) : (
            <Sparkles className="w-12 h-12 text-slate-700" />
          )}
        </div>

        {/* Details Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col overflow-y-auto">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 mb-2">
              {isSeries ? 'ซีรีส์ (Series)' : 'ภาพยนตร์ (Movie)'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{title}</h2>
          </div>

          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-2 my-3 text-xs text-slate-300 font-semibold">
            {details.rating && (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-current" />
                {details.rating}
              </span>
            )}
            {details.year && (
              <span className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {String(details.year).substring(0, 4)}
              </span>
            )}
            {details.episodesCount !== undefined && details.episodesCount > 0 && (
              <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-white/5">
                {details.episodesCount} ตอน
              </span>
            )}
            {details.genre && (
              <span className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-white/5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {details.genre}
              </span>
            )}
          </div>

          {/* Plot / Overview */}
          <div className="flex-1 my-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              เรื่องย่อ
            </h4>
            {loading ? (
              <div className="space-y-2 pt-1 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-800 rounded w-4/6" />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
                {details.plot || item.plot || 'ไม่มีเรื่องย่อสำหรับรายการนี้'}
              </p>
            )}
          </div>

          {/* Play Button */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
            <button
              onClick={() => onPlay(item)}
              className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ เริ่มรับชมเลย</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-white/5"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
