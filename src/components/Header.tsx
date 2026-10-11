import React, { useState, useEffect } from 'react';
import { Clock, Shield, User, Smartphone, Radio, Building2 } from 'lucide-react';
import { HeadSettings } from '../types/attendance';

interface HeaderProps {
  currentRole: 'employee' | 'head';
  onRoleChange: (role: 'employee' | 'head') => void;
  settings: HeadSettings;
  onOpenInstallModal: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  activeEmployeeName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  settings,
  onOpenInstallModal,
  isInstallable,
  isInstalled,
  activeEmployeeName,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [urduDay, setUrduDay] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      
      const days = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
      setUrduDay(days[now.getDay()]);

      const months = [
        'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
        'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
      ];
      setDateStr(`${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs" dir="rtl">
      {/* Top Banner / Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-300 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              سرور فعال ہے: تمام حاضری روزانہ ہیڈ کے پاس خود بخود پہنچ رہی ہے
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-300" />
              {settings.officeName}
            </span>
            <span className="hidden sm:inline opacity-60">|</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
              مفت آن لائن سروس
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <span className="font-bold text-lg font-urdu tracking-tight">حاضری</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-urdu leading-tight">
                  آن لائن حاضری پورٹل
                </h1>
                <span className="hidden md:inline-block text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                  سرور اور ہیڈ سسٹم
                </span>
              </div>
              <p className="text-xs text-slate-500 font-urdu">
                مفت حاضری • مہینے کا حساب • ہیڈ ریکارڈ • APK سپورٹ
              </p>
            </div>
          </div>

          {/* Live Clock & Urdu Date (Hidden on very small screens) */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-right">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 font-mono tracking-wider dir-ltr text-right">
                {time || '00:00:00'}
              </div>
              <div className="text-[11px] text-slate-500 font-urdu">
                {urduDay}، {dateStr}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* APK Install Button */}
            {!isInstalled && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl shadow-xs transition active:scale-95 font-urdu"
                title="موبائل ایپ (APK) انسٹال کریں"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">APK انسٹال کریں</span>
                <span className="sm:hidden">ایپ APK</span>
              </button>
            )}

            {/* Mode Switch: Employee View vs Head / Admin Dashboard */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => onRoleChange('employee')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition font-urdu ${
                  currentRole === 'employee'
                    ? 'bg-white text-blue-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>حاضری لگائیں</span>
              </button>

              <button
                onClick={() => onRoleChange('head')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition font-urdu ${
                  currentRole === 'head'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ہیڈ / سرور ایڈمن</span>
              </button>
            </div>
          </div>
        </div>

        {/* Small screen clock bar */}
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-800 font-mono dir-ltr">{time}</span>
            <span>•</span>
            <span className="font-urdu">{urduDay}، {dateStr}</span>
          </div>

          <div className="text-[11px] text-blue-700 font-medium font-urdu">
            موجودہ ملازم: {activeEmployeeName}
          </div>
        </div>
      </div>
    </header>
  );
};
