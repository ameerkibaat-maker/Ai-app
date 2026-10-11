import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, ArrowDownToLine, Share2, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

interface APKDownloadGuideProps {
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
}

export const APKDownloadGuide: React.FC<APKDownloadGuideProps> = ({
  onInstall,
  isInstallable,
  isInstalled,
  isIOS,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden" dir="rtl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white relative">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold font-urdu mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            اینڈرائیڈ موبائل ایپ (APK & WebAPK)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-urdu leading-tight">
            موبائل فون پر اینڈرائیڈ ایپ (APK) انسٹال کریں
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm font-urdu mt-2 leading-relaxed">
            یہ ایپ اینڈرائیڈ اسمارٹ فونز کے لیے مکمل طور پر آپٹمائزڈ ہے اور گوگل سروسز کے تحت براہ راست بطور APK موبائل کی ہوم اسکرین پر انسٹال ہو جاتی ہے۔
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Current Installation Status Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isInstalled ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isInstalled ? <CheckCircle className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 font-urdu text-base">
                {isInstalled ? 'ایپ آپ کے فون پر انسٹال ہو چکی ہے' : 'ایپ فوری انسٹالیشن کے لیے تیار ہے'}
              </h4>
              <p className="text-xs text-slate-500 font-urdu">
                {isInstalled
                  ? 'آپ اسے موبائل کی اسکرین سے بغیر انٹرنیٹ کے بھی چلا سکتے ہیں۔'
                  : 'نیچے دیا گیا بٹن دبا کر 5 سیکنڈ میں موبائل پر انسٹال کریں۔'}
              </p>
            </div>
          </div>

          {!isInstalled && (
            <button
              onClick={onInstall}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold font-urdu flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition"
            >
              <ArrowDownToLine className="w-5 h-5" />
              <span>ابھی APK انسٹال کریں</span>
            </button>
          )}
        </div>

        {/* 3 Steps to Install on Android */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 font-urdu text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            اینڈرائیڈ موبائل پر انسٹال کرنے کا 3 مرحلہ وار طریقہ:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 relative overflow-hidden">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                1
              </span>
              <h4 className="font-bold text-slate-900 font-urdu text-base">
                کروم براؤزر میں کھولیں
              </h4>
              <p className="text-xs text-slate-600 font-urdu leading-relaxed">
                اس ایپ کے لنک کو اپنے موبائل کے گوگل کروم (Chrome) براؤزر میں اوپن کریں۔ تمام عملہ اس لنک پر حاضری لگا سکتا ہے۔
              </p>
            </div>

            {/* Step 2 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 relative overflow-hidden">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                2
              </span>
              <h4 className="font-bold text-slate-900 font-urdu text-base">
                "Install app" پر کلک کریں
              </h4>
              <p className="text-xs text-slate-600 font-urdu leading-relaxed">
                اوپر دیے گئے بٹن پر کلک کریں یا کروم کے دائیں کونے کے 3 نقطوں (⋮) کو دبا کر <strong>"Install app"</strong> منتخب کریں۔
              </p>
            </div>

            {/* Step 3 */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 relative overflow-hidden">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm font-mono">
                3
              </span>
              <h4 className="font-bold text-slate-900 font-urdu text-base">
                موبائل اسکرین پر مکمل ایپ
              </h4>
              <p className="text-xs text-slate-600 font-urdu leading-relaxed">
                اینڈرائیڈ خود بخود اس کا APK بنا کر فون کی سکرین پر رکھ دے گا۔ روزانہ ایک کلک میں حاضری لگائیں اور ہیڈ کو بھیجیں۔
              </p>
            </div>
          </div>
        </div>

        {/* Benefits of this APK/PWA */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70 space-y-4">
          <h4 className="font-bold text-slate-900 font-urdu text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            اس ایپ کے خصوصی فوائد:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-urdu">
            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>100% مفت:</strong> کسی قسم کی فیس یا سبسکرپشن چارجز نہیں۔</span>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>مرکزی سرور کنٹرول:</strong> تمام حاضری براہ راست ہیڈ ایڈمن کو جاتی ہے۔</span>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>آف لائن کام:</strong> انٹرنیٹ نہ بھی ہو تو حاضری محفوظ رہتی ہے اور نیٹ آنے پر خود سنک ہو جاتی ہے۔</span>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>ماہانہ خودکار حساب:</strong> کل ڈیوٹی کے دن، چھٹیاں اور متوقع تنخواہ خود بخود بن جاتی ہے۔</span>
            </div>
          </div>
        </div>

        {/* Share Link with Staff */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-blue-200 bg-blue-50/60 rounded-2xl">
          <div className="space-y-0.5">
            <span className="font-bold text-blue-950 font-urdu text-sm block">
              عملے اور ملازمین کے ساتھ لنک شیئر کریں:
            </span>
            <span className="text-xs text-blue-700 font-urdu">
              یہ لنک ملازمین کو واٹس ایپ یا ایس ایم ایس کریں تاکہ وہ اپنے موبائل میں کھول کر حاضری لگائیں۔
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold font-urdu transition shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'لنک کاپی ہو گیا!' : 'ایپ کا لنک کاپی کریں'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
