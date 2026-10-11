import React, { useState } from 'react';
import { Calendar, FileText, Send, X, AlertCircle } from 'lucide-react';
import { Employee, LeaveRequest } from '../types/attendance';
import { AttendanceService } from '../services/attendanceStorage';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess: (req: LeaveRequest) => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) => {
  const todayStr = AttendanceService.getFormattedDate(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('casual');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('براہ کرم چھٹی کی وجہ لازمی تحریر کریں۔');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('چھٹی کے اختتام کی تاریخ شروع کی تاریخ سے پہلے نہیں ہو سکتی۔');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newReq = AttendanceService.submitLeaveRequest(
        employee.id,
        leaveType,
        startDate,
        endDate,
        reason.trim()
      );
      setLoading(false);
      onSuccess(newReq);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'درخواست بھیجنے میں خرابی پیش آئی');
    }
  };

  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return diff;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold font-urdu text-lg">چھٹی / رخصت کی درخواست</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-700 block">درخواست گزار ملازم:</span>
              <span className="font-bold text-slate-900 font-urdu">{employee.name}</span>
            </div>
            <span className="text-xs font-mono bg-white px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">
              {employee.employeeCode}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
              چھٹی کی قسم منتخب کریں:
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-urdu"
            >
              <option value="casual">اتفاقی رخصت (Casual Leave)</option>
              <option value="sick">بیماری کی رخصت (Sick Leave)</option>
              <option value="emergency">ہنگامی ضرورت (Emergency Leave)</option>
              <option value="annual">سالانہ چھٹیاں (Annual Leave)</option>
              <option value="unpaid">بغیر تنخواہ رخصت (Leave Without Pay)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                شروع کی تاریخ:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                اختتام کی تاریخ:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="text-xs text-blue-900 bg-blue-50 p-2.5 rounded-lg flex items-center justify-between">
            <span className="font-urdu">کل رخصت کے دن:</span>
            <span className="font-bold text-sm bg-blue-600 text-white px-2 py-0.5 rounded-md">
              {calculateDays()} دن
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
              چھٹی کی وجہ / تفصیل:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: گھریلو ضروری کام، علالت، فیملی تقریب..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-urdu"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition font-urdu text-sm shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>ہیڈ کو درخواست بھیجیں</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition text-xs font-urdu"
            >
              منسوخ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
