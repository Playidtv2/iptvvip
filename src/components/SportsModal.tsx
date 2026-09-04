import React from 'react';
import { X, Trophy, Tv, Clock } from 'lucide-react';

interface SportsModalProps {
  onClose: () => void;
  onWatchChannel?: (channelKeyword: string) => void;
}

interface Match {
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  channel: string;
  status?: string;
}

export const SportsModal: React.FC<SportsModalProps> = ({ onClose, onWatchChannel }) => {
  const matches: Match[] = [
    {
      time: '18:30',
      league: 'พรีเมียร์ลีก อังกฤษ',
      homeTeam: 'แมนเชสเตอร์ ยูไนเต็ด',
      awayTeam: 'ลิเวอร์พูล',
      channel: 'True Premier Football 1',
      status: 'HOT MATCH',
    },
    {
      time: '21:00',
      league: 'พรีเมียร์ลีก อังกฤษ',
      homeTeam: 'อาร์เซนอล',
      awayTeam: 'เชลซี',
      channel: 'True Premier Football 2',
      status: 'สด',
    },
    {
      time: '23:30',
      league: 'พรีเมียร์ลีก อังกฤษ',
      homeTeam: 'แมนเชสเตอร์ ซิตี้',
      awayTeam: 'ท็อตแนม ฮ็อตสเปอร์',
      channel: 'True Premier Football 1',
    },
    {
      time: '02:00',
      league: 'ยูฟ่า แชมเปียนส์ลีก',
      homeTeam: 'เรอัล มาดริด',
      awayTeam: 'บาเยิร์น มิวนิค',
      channel: 'beIN Sports 1',
      status: 'บิ๊กแมตช์',
    },
    {
      time: '02:00',
      league: 'ยูฟ่า แชมเปียนส์ลีก',
      homeTeam: 'ปารีส แซงต์-แชร์กแมง',
      awayTeam: 'บาร์เซโลนา',
      channel: 'beIN Sports 3',
    },
    {
      time: '19:00',
      league: 'ไทยลีก 1',
      homeTeam: 'บุรีรัมย์ ยูไนเต็ด',
      awayTeam: 'การท่าเรือ เอฟซี',
      channel: 'True Ball Thai 1',
      status: 'ดาร์บี้แมตช์',
    },
    {
      time: '20:00',
      league: 'ฟอร์มูล่าวัน (F1)',
      homeTeam: 'รอบชิงชนะเลิศ (Main Race)',
      awayTeam: 'สนาม อิตาเลียน กรังด์ปรีซ์',
      channel: 'beIN Sports 1',
    },
  ];

  return (
    <div
      id="sportsModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-pink-600 text-white shadow">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h3 className="text-base sm:text-lg font-bold tracking-wide">
              ⚽ ตารางถ่ายทอดสดกีฬาประจำวัน
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matches List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            โปรแกรมการแข่งขันยอดนิยม (กดเลือกช่องเพื่อดูทันที)
          </div>

          {matches.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-indigo-500/40 transition-all gap-3 shadow-sm"
            >
              {/* League & Time */}
              <div className="flex items-center gap-3.5">
                <div className="px-3 py-1.5 rounded-full bg-slate-900 text-pink-400 font-extrabold text-xs flex items-center gap-1.5 shrink-0 border border-white/5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{m.time}</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-indigo-400 uppercase">{m.league}</div>
                  <div className="text-sm font-bold text-white">
                    {m.homeTeam} <span className="text-slate-400 font-normal">vs</span> {m.awayTeam}
                  </div>
                </div>
              </div>

              {/* Channel & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                {m.status && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    {m.status}
                  </span>
                )}
                <button
                  onClick={() => {
                    onClose();
                    if (onWatchChannel) onWatchChannel(m.channel);
                  }}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{m.channel}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950 border-t border-white/5 text-center text-xs text-slate-400">
          สามารถค้นหาชื่อช่องถ่ายทอดสดที่ต้องการได้โดยตรงในหมวด <strong>"ช่องทีวีสด"</strong>
        </div>
      </div>
    </div>
  );
};
