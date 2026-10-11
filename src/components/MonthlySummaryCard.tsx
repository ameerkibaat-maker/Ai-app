import React, { useState } from 'react';
import { 
  Calendar, 
  Printer, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Coffee, 
  AlertTriangle,
  Download,
  DollarSign,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Employee, MonthlySummary, AttendanceRecord } from '../types/attendance';
import { AttendanceService } from '../services/attendanceStorage';

interface MonthlySummaryCardProps {
  employees: Employee[];
  activeEmployee: Employee;
  onSelectEmployee: (emp: Employee) => void;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  employees,
  activeEmployee,
  onSelectEmployee,
}) => {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const summary = AttendanceService.calculateMonthlySummary(activeEmployee.id, selectedMonth);
  const allRecords = AttendanceService.getAttendanceRecords().filter(
    r => r.employeeId === activeEmployee.id && r.date.startsWith(selectedMonth)
  );

  // Month list for selection
  const monthOptions = [
    { value: '2026-10', label: 'اکتوبر 2026 (موجودہ مہینہ)' },
    { value: '2026-09', label: 'ستمبر 2026' },
    { value: '2026-08', label: 'اگست 2026' },
    { value: '2026-07', label: 'جولائی 2026' },
    { value: '2026-06', label: 'جون 2026' },
  ];

  // Calculated salary estimate
  const baseSalary = activeEmployee.monthlySalary || 45000;
  const perDayWage = Math.round(baseSalary / 26);
  const earnedSalary = Math.round(summary.dutyDaysCompleted * perDayWage);

  // Generate full calendar days of selected month
  const [yearStr, monthNumStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysList = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();
    const rec = allRecords.find(r => r.date === dateFormatted);

    daysList.push({
      dayNumber: d,
      dateStr: dateFormatted,
      isSunday: dayOfWeek === 0,
      record: rec,
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const urduDayNames = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden" dir="rtl">
      {/* Header with Title and Month Filter */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/60 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <Calendar className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 font-urdu">
                ماہانہ ڈیوٹی و رخصت کا حساب (Monthly Attendance & Duty Report)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-urdu mt-1">
              مہینے کے بعد دیکھیں کہ ملازم نے کتنے دن ڈیوٹی کی اور کتنی چھٹیاں کیں
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Employee Switcher */}
            <div>
              <select
                value={activeEmployee.id}
                onChange={(e) => {
                  const emp = employees.find(x => x.id === e.target.value);
                  if (emp) onSelectEmployee(emp);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-urdu focus:ring-2 focus:ring-blue-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Dropdown */}
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-urdu focus:ring-2 focus:ring-blue-500"
              >
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-urdu transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>رپورٹ پرنٹ کریں</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Header (Visible only on print) */}
      <div className="hidden print-only p-6 border-b text-center space-y-1">
        <h1 className="text-2xl font-bold font-urdu">ماہانہ حاضری و تنخواہ سلپ</h1>
        <p className="text-sm font-urdu">
          ملازم: {activeEmployee.name} | عہدہ: {activeEmployee.role} | کوڈ: {activeEmployee.employeeCode} | مہینہ: {selectedMonth}
        </p>
      </div>

      {/* Primary KPI Cards (کتنے دن ڈیوٹی، کتنی چھٹیاں) */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Duty Days */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 font-urdu">کتنے دن ڈیوٹی کی:</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono">
              {summary.dutyDaysCompleted} <span className="text-sm font-urdu font-bold text-emerald-700">دن</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-urdu mt-1">
              مطلوبہ ورکنگ دن: {summary.workingDaysExpected} میں سے
            </p>
          </div>

          {/* Card 2: Leaves Taken */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 font-urdu">کتنی چھٹیاں کیں:</span>
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono">
              {summary.leaveDays} <span className="text-sm font-urdu font-bold text-amber-700">دن</span>
            </div>
            <p className="text-[11px] text-amber-700 font-urdu mt-1">
              منظور شدہ باقاعدہ رخصت
            </p>
          </div>

          {/* Card 3: Absents */}
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800 font-urdu">غیر حاضر (Absents):</span>
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-950 font-mono">
              {summary.absentDays} <span className="text-sm font-urdu font-bold text-rose-700">دن</span>
            </div>
            <p className="text-[11px] text-rose-700 font-urdu mt-1">
              بغیر اطلاع غیر حاضری
            </p>
          </div>

          {/* Card 4: Attendance Percentage */}
          <div className="bg-gradient-to-br from-blue-500/10 via-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 font-urdu">حاضری کی شرح:</span>
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-mono">
              %{summary.attendancePercentage}
            </div>
            <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Details: Late days, Total hours, Estimated Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-urdu">تاخیر سے آنے والے دن (Late):</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{summary.lateDays} دن</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-urdu">کل ڈیوٹی کے گھنٹے:</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{summary.totalWorkingHours} گھنٹے</span>
            </div>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 block font-urdu">ڈیوٹی کے مطابق بننے والی رقم:</span>
              <span className="text-lg font-bold text-emerald-950 font-mono">
                روپے {earnedSalary.toLocaleString('en-PK')}
              </span>
            </div>
            <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md font-urdu">
              حساب برائے تنخواہ
            </span>
          </div>
        </div>

        {/* Calendar Grid of the Month */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-urdu text-sm">
              ماہانہ حاضری کیلنڈر ویو ({daysInMonth} ایام)
            </h3>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-urdu">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> حاضر
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> لیٹ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> رخصت
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> غیر حاضر
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> اتوار
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {daysList.map((day) => {
              let bg = 'bg-slate-50 border-slate-200 text-slate-600';
              let badgeText = 'خالی';

              if (day.isSunday) {
                bg = 'bg-slate-100 border-slate-200 text-slate-400';
                badgeText = 'اتوار';
              } else if (day.record) {
                if (day.record.status === 'present') {
                  bg = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                  badgeText = 'حاضر';
                } else if (day.record.status === 'late') {
                  bg = 'bg-amber-50 border-amber-300 text-amber-900';
                  badgeText = 'لیٹ';
                } else if (day.record.status === 'leave') {
                  bg = 'bg-blue-50 border-blue-300 text-blue-900';
                  badgeText = 'چھٹی';
                } else if (day.record.status === 'absent') {
                  bg = 'bg-rose-50 border-rose-300 text-rose-900';
                  badgeText = 'غیر حاضر';
                }
              }

              return (
                <div
                  key={day.dayNumber}
                  className={`border rounded-xl p-2 text-center transition hover:shadow-xs ${bg}`}
                >
                  <div className="text-sm font-bold font-mono">{day.dayNumber}</div>
                  <div className="text-[10px] font-urdu font-medium mt-0.5 truncate">
                    {badgeText}
                  </div>
                  {day.record?.workHours ? (
                    <div className="text-[9px] font-mono text-slate-500">
                      {day.record.workHours}h
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Daily Breakdown Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100/70 p-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 font-urdu text-sm">
              روزانہ کی حاضری و اوقات کار کا مکمل رجسٹر
            </h3>
            <span className="text-xs text-slate-500 font-urdu">
              کل ریکارڈز: {allRecords.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-urdu border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">تاریخ</th>
                  <th className="py-2.5 px-3">آمد کا وقت</th>
                  <th className="py-2.5 px-3">چھٹی کا وقت</th>
                  <th className="py-2.5 px-3">ڈیوٹی دورانیہ</th>
                  <th className="py-2.5 px-3">کیفیت (حالت)</th>
                  <th className="py-2.5 px-3">نوٹ / ریمارکس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-urdu">
                      اس مہینے کا کوئی حاضری ریکارڈ موجود نہیں ہے۔
                    </td>
                  </tr>
                ) : (
                  allRecords
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((rec) => {
                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          عام
                        </span>
                      );

                      if (rec.status === 'present') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ حاضر
                          </span>
                        );
                      } else if (rec.status === 'late') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠️ تاخیر
                          </span>
                        );
                      } else if (rec.status === 'leave') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            رخصت / چھٹی
                          </span>
                        );
                      } else if (rec.status === 'absent') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            ✕ غیر حاضر
                          </span>
                        );
                      } else if (rec.status === 'holiday') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                            ہفتہ وار چھٹی
                          </span>
                        );
                      }

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                            {rec.date}
                          </td>
                          <td className="py-2.5 px-3 font-mono dir-ltr text-right">
                            {rec.checkInTime || '--:--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono dir-ltr text-right">
                            {rec.checkOutTime || '--:--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {rec.workHours ? `${rec.workHours} گھنٹے` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-urdu">
                            {statusBadge}
                          </td>
                          <td className="py-2.5 px-3 font-urdu text-slate-500 truncate max-w-xs">
                            {rec.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
