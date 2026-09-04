import React, { useState } from 'react';
import { X, Crown, Check, QrCode, Upload, ArrowLeft, MessageCircle } from 'lucide-react';

interface PackagesModalProps {
  onClose: () => void;
}

interface PackageItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  popular?: boolean;
  color: string;
  features: string[];
}

export const PackagesModal: React.FC<PackagesModalProps> = ({ onClose }) => {
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [slipName, setSlipName] = useState<string>('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const packages: PackageItem[] = [
    {
      id: 'day',
      name: 'รายวัน ทดลองใช้',
      duration: '1 วัน',
      price: '50',
      color: 'border-pink-500/50 hover:border-pink-500',
      features: [
        'รับชมช่องสด Full HD / 4K',
        'ภาพยนตร์และซีรีส์ครบครัน',
        'ความคมชัดสูง ลื่นไหล',
        '1 จอการรับชม',
      ],
    },
    {
      id: 'month1',
      name: 'มาตรฐาน 1 เดือน',
      duration: '30 วัน',
      price: '250',
      popular: true,
      color: 'border-blue-500/50 hover:border-blue-500',
      features: [
        'รับชมทุกช่องบอล & กีฬาสด',
        'หนัง VOD อัปเดตใหม่ทุกสัปดาห์',
        'ซีรีส์ฮิต พากย์ไทย & ซับไทย',
        'เซิร์ฟเวอร์เสถียร ไม่กระตุก',
      ],
    },
    {
      id: 'month3',
      name: 'สุดคุ้ม 3 เดือน',
      duration: '90 วัน',
      price: '650',
      color: 'border-emerald-500/50 hover:border-emerald-500',
      features: [
        'ประหยัดกว่ารายเดือน',
        'รวมทุกรายการแข่งขันกีฬา',
        'หนังและซีรีส์ระดับมาสเตอร์',
        'ระบบสำรองสัญญาณอัตโนมัติ',
      ],
    },
    {
      id: 'year1',
      name: 'VIP รายปี',
      duration: '365 วัน',
      price: '2,200',
      color: 'border-amber-500/50 hover:border-amber-500',
      features: [
        'คุ้มค่าที่สุด เฉลี่ยเดือนละ 183.-',
        'ช่องพรีเมียมพิเศษเฉพาะสมาชิก VIP',
        'รับสิทธิ์ดูต่ออุปกรณ์ที่ 2 ได้',
        'การสนับสนุนดูแลแบบเร่งด่วน',
      ],
    },
    {
      id: 'lifetime',
      name: 'VIP ตลอดชีพ',
      duration: 'ตลอดชีพ (Lifetime)',
      price: '4,500',
      color: 'border-purple-500/50 hover:border-purple-500',
      features: [
        'จ่ายครั้งเดียว จบทุกอย่าง',
        'ไม่มีหมดอายุ ตลอดการใช้งาน',
        'สตรีมคุณภาพสูงสุด 4K UHD',
        'บริการระดับ Super VIP ตลอด 24 ชม.',
      ],
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSlipName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      id="packagesModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-pink-600 text-white shadow">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-wide">
                💎 แพ็กเกจสมาชิก VIP & ต่ออายุบัญชี
              </h3>
              <p className="text-[11px] text-indigo-100 font-medium">
                เลือกแพ็กเกจที่ต้องการเพื่อเปิดสัญญาณหรือต่ออายุทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {!selectedPkg ? (
            /* Package Grid Selection */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="relative flex flex-col justify-between p-5 rounded-3xl bg-slate-800/60 border border-white/10 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-pink-500/30">
                      🔥 ยอดนิยม
                    </span>
                  )}

                  <div>
                    <div className="text-xs font-bold text-indigo-400">{pkg.duration}</div>
                    <h4 className="text-lg font-bold text-white mt-0.5">{pkg.name}</h4>

                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">{pkg.price}</span>
                      <span className="text-xs text-slate-400 ml-1 font-semibold">บาท</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setSelectedPkg(pkg)}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-500/25 active:scale-[0.98]"
                  >
                    เลือกแพ็กเกจนี้
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Checkout with PromptPay QR & Slip */
            <div className="max-w-xl mx-auto">
              <button
                onClick={() => {
                  setSelectedPkg(null);
                  setSubmitted(false);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4 font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> เลือกแพ็กเกจอื่น
              </button>

              <div className="bg-slate-800/80 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
                <div className="text-center mb-5">
                  <span className="text-xs font-bold text-indigo-400">สรุปคำสั่งซื้อ</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">{selectedPkg.name}</h4>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {selectedPkg.price} <span className="text-sm font-semibold text-slate-400">บาท</span>
                  </div>
                </div>

                {submitted ? (
                  <div className="py-8 text-center space-y-3 animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Check className="w-6 h-6" />
                    </div>
                    <h5 className="text-lg font-bold text-white">ส่งข้อมูลชำระเงินเรียบร้อยแล้ว!</h5>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                      ระบบจะทำการตรวจสอบยอดเงินและเปิดสัญญาณภายใน 15 นาที หรือสามารถแจ้งสลิปตรงกับแอดมินทาง LINE ID: <strong className="text-pink-400">@680salib</strong>
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                      >
                        เสร็จสิ้น / ปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* PromptPay QR Section */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 text-center shadow">
                      <div className="text-xs font-black tracking-wider uppercase mb-1">
                        พร้อมเพย์ (PromptPay QR)
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg bg-white my-1">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021129370016A0000006770101110113006680salib5802TH5303764540550.005802TH6304"
                          alt="PromptPay QR"
                          className="w-40 h-40 object-contain mx-auto"
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        สแกนจ่ายได้ทุกธนาคาร (ยอดเงิน {selectedPkg.price} บาท)
                      </p>
                    </div>

                    {/* Account Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Username ที่ต้องการเปิดใช้งาน / ต่ออายุ
                        </label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="เช่น playidtv2535 หรือชื่อใหม่"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Password (รหัสผ่าน)
                        </label>
                        <input
                          type="text"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="รหัสผ่าน"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Slip Upload */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          แนบรูปสลิปการโอนเงิน
                        </label>
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 hover:border-indigo-500/60 rounded-2xl bg-slate-900/50 cursor-pointer transition-colors">
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-300">
                            {slipName || 'คลิกเพื่อเลือกไฟล์รูปสลิป'}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            รองรับไฟล์ JPG, PNG
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                    >
                      ✅ ยืนยันการชำระเงิน
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Support Note */}
        <div className="p-4 bg-slate-950 border-t border-white/5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4 text-pink-400" />
          <span>
            สอบถามข้อมูลเพิ่มเติมหรือแจ้งปัญหา ติดต่อแอดมิน LINE ID: <strong className="text-white">@680salib</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
