import React from 'react';
import { Download, Smartphone, CheckCircle, ShieldCheck, Share, ArrowDownToLine, X, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white text-right relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-urdu">موبائل ایپ (APK) انسٹال کریں</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
                  مفت اینڈرائیڈ ایپ
                </span>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                حاضری ایپ کو اپنے موبائل پر اصلی ایپ (APK) کی طرح چلائیں
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700">
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 font-urdu text-lg">ایپ پہلے سے انسٹال ہے!</h4>
              <p className="text-sm text-emerald-700">
                یہ ایپ آپ کے موبائل کی ہوم اسکرین پر موجود ہے۔ آپ اسے وہیں سے بغیر براؤزر کھولے چلا سکتے ہیں۔
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block font-urdu">1-کلک میں انسٹالیشن</span>
                    <span className="text-slate-500 text-[11px]">بغیر کسی پلے اسٹور فیس کے مفت انسٹال کریں</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block font-urdu">ہیڈ سرور سے لائیو رابطہ</span>
                    <span className="text-slate-500 text-[11px]">روزانہ کی حاضری سیدھی ہیڈ کے پاس جاتی ہے</span>
                  </div>
                </div>
              </div>

              {/* Install instructions */}
              {isInstallable ? (
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      const ok = await onInstall();
                      if (ok) onClose();
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition font-urdu text-base"
                  >
                    <ArrowDownToLine className="w-5 h-5" />
                    ابھی موبائل پر APK انسٹال کریں (Install)
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    بٹن دبانے پر اینڈرائیڈ سسٹم فوری طور پر ایپ کا آئیکون آپ کے فون کی سکرین پر شامل کر دے گا۔
                  </p>
                </div>
              ) : isIOS ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-right space-y-2">
                  <h4 className="font-bold text-amber-900 font-urdu flex items-center gap-2">
                    <Share className="w-4 h-4 text-amber-600" />
                    آئی فون (iPhone / iPad) پر انسٹال کرنے کا طریقہ:
                  </h4>
                  <ol className="text-xs text-amber-800 space-y-1.5 list-decimal pr-4">
                    <li>سفاری (Safari) براؤزر میں نیچے <strong>شیئر (Share)</strong> کے بٹن کو دبائیں۔</li>
                    <li>تھوڑا نیچے سکرول کریں اور <strong>"Add to Home Screen"</strong> منتخب کریں۔</li>
                    <li>اوپر دائیں کونے میں <strong>"Add"</strong> پر کلک کریں۔ ایپ اسکرین پر آ جائے گی۔</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-right space-y-3">
                  <h4 className="font-bold text-blue-950 font-urdu flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-700" />
                    اینڈرائیڈ موبائل پر انسٹال کرنے کا آسان طریقہ:
                  </h4>
                  <ol className="text-xs text-blue-900 space-y-2 list-decimal pr-4">
                    <li>اپنے موبائل کروم (Chrome) براؤزر کے اوپر دائیں کونے میں <strong>تین نقطوں (⋮)</strong> پر کلک کریں۔</li>
                    <li>مینو میں سے <strong>"Install app"</strong> یا <strong>"Add to Home screen"</strong> منتخب کریں۔</li>
                    <li><strong>"Install"</strong> کے بٹن پر تصدیق کریں، ایپ مکمل APK کی طرح انسٹال ہو جائے گی۔</li>
                  </ol>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hazri Online Attendance • ورژن 1.0.0</span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              ٹھیک ہے، بند کریں
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
