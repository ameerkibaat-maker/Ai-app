import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  LogOut, 
  FileText, 
  AlertCircle, 
  Building, 
  Calendar, 
  UserCheck, 
  Send,
  Navigation,
  Check,
  Smartphone
} from 'lucide-react';
import { Employee, AttendanceRecord, HeadSettings } from '../types/attendance';
import { AttendanceService } from '../services/attendanceStorage';

interface MarkAttendanceCardProps {
  employees: Employee[];
  activeEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
  onOpenLeaveModal: () => void;
  onAttendanceUpdated: () => void;
  settings: HeadSettings;
  onOpenInstallModal: () => void;
  isInstalled: boolean;
}

export const MarkAttendanceCard: React.FC<MarkAttendanceCardProps> = ({
  employees,
  activeEmployee,
  onSelectEmployee,
  onOpenLeaveModal,
  onAttendanceUpdated,
  settings,
  onOpenInstallModal,
  isInstalled,
}) => {
  const todayStr = AttendanceService.getFormattedDate(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(
    AttendanceService.getRecordForDate(activeEmployee.id, todayStr)
  );
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [elapsedDuty, setElapsedDuty] = useState<string>('');

  // Refresh record when active employee changes
  useEffect(() => {
    const rec = AttendanceService.getRecordForDate(activeEmployee.id, todayStr);
    setTodayRecord(rec);
    setActionMessage(null);
  }, [activeEmployee.id, todayStr]);

  // Live timer for duty elapsed time if checked in but not checked out
  useEffect(() => {
    if (!todayRecord || !todayRecord.checkInTime || todayRecord.checkOutTime) {
      setElapsedDuty('');
      return;
    }

    const updateElapsed = () => {
      const now = new Date();
      const [h, m, s] = (todayRecord.checkInTime || '00:00:00').split(':').map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(h, m, s || 0, 0);

      const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setElapsedDuty(`${hours} گھنٹے ${mins} منٹ ${secs} سیکنڈ`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [todayRecord]);

  // Location retrieval
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔');
      return;
    }
    setIsGettingLocation(true);
    setLocationMessage('مقام معلوم کیا جا رہا ہے...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingLocation(false);
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: 'ڈیوٹی لوکیشن تصدیق شدہ',
        };
        setLocation(coords);
        setLocationMessage(`مقام تصدیق ہو گیا: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setIsGettingLocation(false);
        setLocationMessage('لوکیشن کی اجازت نہیں ملی۔ حاضری بغیر لوکیشن کے بھی لگ جائے گی۔');
      },
      { timeout: 8000 }
    );
  };

  // Check In
  const handleCheckIn = () => {
    try {
      const result = AttendanceService.checkIn(activeEmployee.id, {
        location: location || undefined,
        notes: notes.trim() || undefined,
      });

      setTodayRecord(result.record);
      setActionMessage({
        text: `${result.message} سرور پر ہیڈ کو مطلع کر دیا گیا۔`,
        type: 'success',
      });
      onAttendanceUpdated();
    } catch (err: unknown) {
      setActionMessage({
        text: err instanceof Error ? err.message : 'حاضری درج نہیں ہو سکی',
        type: 'error',
      });
    }
  };

  // Check Out
  const handleCheckOut = () => {
    try {
      const result = AttendanceService.checkOut(activeEmployee.id, {
        notes: notes.trim() || undefined,
      });

      setTodayRecord(result.record);
      setActionMessage({
        text: `${result.message} چھٹی کا وقت ہیڈ سرور پر پہنچ گیا۔`,
        type: 'success',
      });
      onAttendanceUpdated();
    } catch (err: unknown) {
      setActionMessage({
        text: err instanceof Error ? err.message : 'چھٹی کا وقت درج نہیں ہو سکا',
        type: 'error',
      });
    }
  };

  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden" dir="rtl">
      {/* Top Banner with Employee Selection */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Employee Dropdown / Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-urdu text-2xl font-bold text-amber-300 shadow-inner">
              {activeEmployee.name.charAt(0)}
            </div>
            <div>
              <span className="text-blue-300 text-xs font-urdu block">حاضری لگانے والا ملازم:</span>
              <div className="flex items-center gap-2">
                <select
                  value={activeEmployee.id}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    if (emp) onSelectEmployee(emp);
                  }}
                  className="bg-white/15 hover:bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 text-base sm:text-lg font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-urdu cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="text-slate-900">
                      {emp.name} ({emp.role}) - {emp.employeeCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-urdu">
                <span>شعبہ: {activeEmployee.department}</span>
                <span>•</span>
                <span>فون: {activeEmployee.phone}</span>
              </div>
            </div>
          </div>

          {/* Shift Timings Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-xs space-y-1">
            <div className="flex items-center justify-between gap-4 text-blue-200 font-urdu">
              <span>ڈیوٹی اوقات:</span>
              <span className="font-mono text-white font-bold dir-ltr">
                {settings.shiftStartTime} - {settings.shiftEndTime}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-300 font-urdu">
              <span>تاخیر کی گنجائش:</span>
              <span>{settings.lateGraceMinutes} منٹ تک</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 mx-6 mt-6 rounded-2xl border flex items-center gap-3 font-urdu text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{actionMessage.text}</span>
        </div>
      )}

      {/* Main Interactive Check-In / Check-Out Area */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Status Tracker Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {/* Card 1: Check In Status */}
          <div className={`p-5 rounded-2xl border transition ${
            isCheckedIn 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={`w-5 h-5 ${isCheckedIn ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold font-urdu">آمد کا وقت (Check-In)</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono dir-ltr">
              {todayRecord?.checkInTime || '--:--:--'}
            </div>
            <div className="text-xs mt-1 font-urdu font-medium">
              {isCheckedIn ? (
                <span className={todayRecord?.status === 'late' ? 'text-amber-600' : 'text-emerald-700'}>
                  {todayRecord?.status === 'late' ? '⚠️ تاخیر (Late)' : '✓ بروقت حاضر'}
                </span>
              ) : (
                <span className="text-slate-400">ابھی درج نہیں ہوا</span>
              )}
            </div>
          </div>

          {/* Card 2: Check Out Status */}
          <div className={`p-5 rounded-2xl border transition ${
            isCheckedOut 
              ? 'bg-blue-50/70 border-blue-200 text-blue-950' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <LogOut className={`w-5 h-5 ${isCheckedOut ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold font-urdu">چھٹی کا وقت (Check-Out)</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono dir-ltr">
              {todayRecord?.checkOutTime || '--:--:--'}
            </div>
            <div className="text-xs mt-1 font-urdu font-medium">
              {isCheckedOut ? (
                <span className="text-blue-700">✓ چھٹی درج ہو گئی</span>
              ) : isCheckedIn ? (
                <span className="text-amber-600 animate-pulse">ڈیوٹی جاری ہے...</span>
              ) : (
                <span className="text-slate-400">غیر حاضر</span>
              )}
            </div>
          </div>

          {/* Card 3: Total Working Hours */}
          <div className={`p-5 rounded-2xl border transition ${
            todayRecord?.workHours 
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold font-urdu">کل ڈیوٹی کے گھنٹے</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono dir-ltr">
              {todayRecord?.workHours ? `${todayRecord.workHours} hrs` : isCheckedIn ? elapsedDuty || 'جاری...' : '0.0 hrs'}
            </div>
            <div className="text-xs mt-1 font-urdu font-medium text-indigo-700">
              {isCheckedOut ? 'آج کی ڈیوٹی مکمل' : isCheckedIn ? 'لائیو ٹائمر' : 'ڈیوٹی شروع کریں'}
            </div>
          </div>
        </div>

        {/* Big Punch Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              className="w-full sm:w-auto min-w-[280px] py-5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center gap-3 font-urdu group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <span>آج کی حاضری لگائیں (Check-In)</span>
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={handleCheckOut}
              className="w-full sm:w-auto min-w-[280px] py-5 px-8 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-700/25 active:scale-95 transition flex items-center justify-center gap-3 font-urdu group"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span>چھٹی درج کریں (Check-Out)</span>
            </button>
          ) : (
            <div className="w-full max-w-md py-4 px-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold font-urdu text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                آج کی حاضری اور چھٹی مکمل درج ہو چکی ہے!
              </div>
              <p className="text-xs text-emerald-700 font-urdu">
                یہ ریکارڈ ہیڈ سرور میں محفوظ ہے اور ماہانہ تنخواہ کارڈ میں شامل کر دیا گیا ہے۔
              </p>
            </div>
          )}
        </div>

        {/* Location & Remarks Row */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-urdu text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>مقام کی تصدیق (GPS Location):</span>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation || !!location}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium font-urdu flex items-center gap-1.5 transition ${
                location
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {location ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Navigation className="w-3.5 h-3.5 text-blue-600" />}
              {location ? 'مقام تصدیق شدہ' : isGettingLocation ? 'معلوم ہو رہا ہے...' : 'مقام معلوم کریں'}
            </button>
          </div>

          {locationMessage && (
            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
              {locationMessage}
            </div>
          )}

          {/* Daily Note / Remark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
              اضافی ریمارکس / نوٹ (اختیاری):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: فیلڈ سائٹ کا دورہ، دیر سے آنے کی وجہ، اوور ٹائم وغیرہ..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-urdu text-slate-800"
            />
          </div>
        </div>

        {/* Quick Footer Action Links */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onOpenLeaveModal}
            className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition font-urdu"
          >
            <FileText className="w-4 h-4" />
            <span>چھٹی / رخصت کی درخواست دیں (Leave Request)</span>
          </button>

          {!isInstalled && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition font-urdu"
            >
              <Smartphone className="w-4 h-4" />
              <span>موبائل پر APK ایپ ڈاؤن لوڈ کریں</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
