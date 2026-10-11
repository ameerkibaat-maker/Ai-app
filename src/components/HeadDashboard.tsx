import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  XCircle, 
  UserPlus, 
  Bell, 
  Settings, 
  Download, 
  Printer, 
  Radio, 
  Check, 
  X, 
  Edit3, 
  FileSpreadsheet, 
  Search,
  AlertCircle
} from 'lucide-react';
import { Employee, HeadSettings, LeaveRequest, AttendanceRecord, HeadAnnouncement } from '../types/attendance';
import { AttendanceService } from '../services/attendanceStorage';

interface HeadDashboardProps {
  settings: HeadSettings;
  onUpdateSettings: (settings: HeadSettings) => void;
  employees: Employee[];
  onEmployeesUpdated: () => void;
  onAttendanceUpdated: () => void;
}

export const HeadDashboard: React.FC<HeadDashboardProps> = ({
  settings,
  onUpdateSettings,
  employees,
  onEmployeesUpdated,
  onAttendanceUpdated,
}) => {
  const todayStr = AttendanceService.getFormattedDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeTab, setActiveTab] = useState<'live' | 'leaves' | 'staff' | 'settings' | 'broadcast'>('live');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Employee Form State
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpCode, setNewEmpCode] = useState(`EMP-${100 + employees.length + 1}`);
  const [newEmpDept, setNewEmpDept] = useState('آپریشنز');
  const [newEmpSalary, setNewEmpSalary] = useState('45000');

  // Manual Attendance Mark State
  const [manualEmpId, setManualEmpId] = useState<string | null>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceRecord['status']>('present');
  const [manualCheckIn, setManualCheckIn] = useState('09:00:00');
  const [manualCheckOut, setManualCheckOut] = useState('17:00:00');
  const [manualNotes, setManualNotes] = useState('');

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<HeadAnnouncement['priority']>('normal');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Office Settings State
  const [officeName, setOfficeName] = useState(settings.officeName);
  const [shiftStart, setShiftStart] = useState(settings.shiftStartTime);
  const [shiftEnd, setShiftEnd] = useState(settings.shiftEndTime);
  const [graceMinutes, setGraceMinutes] = useState(settings.lateGraceMinutes);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Compute Today's Stats
  const todayStats = AttendanceService.getTodayHeadStats(selectedDate);
  const allRecords = AttendanceService.getAttendanceRecords().filter(r => r.date === selectedDate);
  const leaves = AttendanceService.getLeaveRequests();
  const announcements = AttendanceService.getAnnouncements();

  // Add Employee Handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    AttendanceService.addEmployee({
      name: newEmpName.trim(),
      role: newEmpRole.trim() || 'سٹاف ممبر',
      phone: newEmpPhone.trim() || '0300-0000000',
      employeeCode: newEmpCode.trim() || `EMP-${Date.now().toString().slice(-3)}`,
      department: newEmpDept,
      joinDate: todayStr,
      monthlySalary: parseInt(newEmpSalary, 10) || 40000,
    });

    setShowAddEmpModal(false);
    setNewEmpName('');
    setNewEmpRole('');
    setNewEmpPhone('');
    onEmployeesUpdated();
  };

  // Leave Approval Handler
  const handleReviewLeave = (leaveId: string, action: 'approved' | 'rejected') => {
    AttendanceService.reviewLeaveRequest(leaveId, action);
    onAttendanceUpdated();
  };

  // Save Manual Attendance
  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmpId) return;

    AttendanceService.headMarkAttendance(
      manualEmpId,
      selectedDate,
      manualStatus,
      manualCheckIn,
      manualCheckOut,
      manualNotes
    );

    setManualEmpId(null);
    onAttendanceUpdated();
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: HeadSettings = {
      ...settings,
      officeName,
      shiftStartTime: shiftStart,
      shiftEndTime: shiftEnd,
      lateGraceMinutes: Number(graceMinutes),
    };
    AttendanceService.saveSettings(updated);
    onUpdateSettings(updated);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Post Announcement
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    AttendanceService.addAnnouncement(annTitle.trim(), annMessage.trim(), annPriority);
    setAnnTitle('');
    setAnnMessage('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const records = AttendanceService.getAttendanceRecords().filter(r => r.date === selectedDate);
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Employee Code,Employee Name,Date,Check In,Check Out,Work Hours,Status,Notes\n';

    employees.forEach(emp => {
      const rec = records.find(r => r.employeeId === emp.id);
      const row = [
        `"${emp.employeeCode}"`,
        `"${emp.name}"`,
        `"${selectedDate}"`,
        `"${rec?.checkInTime || 'N/A'}"`,
        `"${rec?.checkOutTime || 'N/A'}"`,
        `"${rec?.workHours || 0}"`,
        `"${rec?.status || 'absent'}"`,
        `"${rec?.notes || ''}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hazri-report-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden" dir="rtl">
      {/* Head Control Room Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold font-urdu">سرور ہیڈ ڈیش بورڈ (Head Control Room)</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                  لائیو سرور
                </span>
              </div>
              <p className="text-xs text-blue-200 font-urdu mt-0.5">
                تمام ملازمین کی روزانہ کی آن لائن حاضری اور چھٹیوں کا مرکزی سرور ریکارڈ
              </p>
            </div>
          </div>

          {/* Date Picker & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition font-urdu shadow-xs"
              title="CSV ایکسل شیٹ ڈاؤن لوڈ کریں"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ایکسل شیٹ ڈاؤن لوڈ</span>
            </button>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition font-urdu shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>نیا ملازم شامل کریں</span>
            </button>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-blue-200 block font-urdu">کل ملازمین</span>
            <span className="text-xl font-bold font-mono text-white">{todayStats.totalStaff}</span>
          </div>

          <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-emerald-300 block font-urdu">آج حاضر (Present)</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{todayStats.presentCount}</span>
          </div>

          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-amber-300 block font-urdu">تاخیر سے آمد (Late)</span>
            <span className="text-xl font-bold font-mono text-amber-300">{todayStats.lateCount}</span>
          </div>

          <div className="bg-blue-500/15 border border-blue-500/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] text-blue-300 block font-urdu">چھٹی پر (On Leave)</span>
            <span className="text-xl font-bold font-mono text-blue-300">{todayStats.leaveCount}</span>
          </div>

          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-rose-300 block font-urdu">غیر حاضر / باقی</span>
            <span className="text-xl font-bold font-mono text-rose-300">{todayStats.absentCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-6 pt-3 bg-slate-50/70 overflow-x-auto text-xs font-bold font-urdu">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'live'
              ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>روزانہ کی لائیو حاضری فہرست</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'leaves'
              ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>چھٹیوں کی درخواستیں ({leaves.filter(l => l.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'staff'
              ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ملازمین کی فہرست ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'broadcast'
              ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>ہیڈ کا اعلان / میسج</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-blue-700 text-blue-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>اوقات کار کی ترتیبات</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-6">
        {/* TAB 1: LIVE ATTENDANCE ROSTER */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ملازم کا نام، کوڈ یا عہدہ تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-urdu focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-urdu">
                تاریخ: <strong className="text-slate-800 font-mono">{selectedDate}</strong> کے تمام ملازمین کا لائیو اسٹیٹس
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-urdu border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ملازم کا نام و کوڈ</th>
                      <th className="py-3 px-3">عہدہ / شعبہ</th>
                      <th className="py-3 px-3">آمد کا وقت (In)</th>
                      <th className="py-3 px-3">چھٹی کا وقت (Out)</th>
                      <th className="py-3 px-3">کل اوقات</th>
                      <th className="py-3 px-3">کیفیت (Status)</th>
                      <th className="py-3 px-3">نوٹ / مقام</th>
                      <th className="py-3 px-4 text-center">ہیڈ ایکشن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => {
                      const rec = allRecords.find(r => r.employeeId === emp.id);

                      let badge = (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ غیر حاضر
                        </span>
                      );

                      if (rec?.status === 'present') {
                        badge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ حاضر
                          </span>
                        );
                      } else if (rec?.status === 'late') {
                        badge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ⚠️ تاخیر
                          </span>
                        );
                      } else if (rec?.status === 'leave') {
                        badge = (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            رخصت / چھٹی
                          </span>
                        );
                      }

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 font-urdu text-sm">{emp.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono">{emp.employeeCode}</span>
                          </td>
                          <td className="py-3 px-3 font-urdu">
                            <div className="text-slate-800">{emp.role}</div>
                            <span className="text-[10px] text-slate-400">{emp.department}</span>
                          </td>
                          <td className="py-3 px-3 font-mono dir-ltr text-right">
                            {rec?.checkInTime ? (
                              <span className="font-bold text-slate-800">{rec.checkInTime}</span>
                            ) : (
                              <span className="text-slate-300">--:--</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono dir-ltr text-right">
                            {rec?.checkOutTime ? (
                              <span className="font-bold text-slate-800">{rec.checkOutTime}</span>
                            ) : (
                              <span className="text-slate-300">--:--</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {rec?.workHours ? `${rec.workHours}h` : '--'}
                          </td>
                          <td className="py-3 px-3 font-urdu">
                            {badge}
                          </td>
                          <td className="py-3 px-3 font-urdu text-slate-500 max-w-xs truncate">
                            {rec?.notes || (rec?.location ? '📍 مقام کی تصدیق شدہ' : '-')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setManualEmpId(emp.id);
                                setManualStatus(rec?.status || 'present');
                                setManualCheckIn(rec?.checkInTime || '09:00:00');
                                setManualCheckOut(rec?.checkOutTime || '17:00:00');
                                setManualNotes(rec?.notes || '');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-urdu font-medium border border-slate-200 transition"
                            >
                              ترمیم / درج کریں
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEAVE REQUESTS */}
        {activeTab === 'leaves' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 font-urdu text-base">
              ملازمین کی طرف سے بھیجی گئی چھٹیوں کی درخواستیں
            </h3>

            {leaves.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-urdu border border-dashed rounded-2xl">
                فی الوقت چھٹی کی کوئی درخواست موصول نہیں ہوئی۔
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leaves.map((req) => (
                  <div key={req.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 font-urdu text-base">{req.employeeName}</span>
                        <span className="text-xs text-slate-500 block">
                          قسم: {req.leaveType === 'casual' ? 'اتفاقی' : req.leaveType === 'sick' ? 'بیماری' : req.leaveType}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-urdu ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status === 'pending' ? 'زیر غور' : req.status === 'approved' ? 'منظور شدہ' : 'مسترد'}
                      </span>
                    </div>

                    <div className="text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-700 font-urdu">
                      <div className="flex justify-between mb-1 text-slate-500">
                        <span>تاریخ: {req.startDate} سے {req.endDate}</span>
                        <span className="font-bold text-blue-700">{req.daysCount} دن</span>
                      </div>
                      <p className="mt-1"><strong>وجہ:</strong> {req.reason}</p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleReviewLeave(req.id, 'approved')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-urdu flex items-center justify-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>چھٹی منظور کریں</span>
                        </button>
                        <button
                          onClick={() => handleReviewLeave(req.id, 'rejected')}
                          className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold font-urdu flex items-center justify-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>مسترد</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STAFF DIRECTORY */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 font-urdu text-base">
                ملازمین کی مکمل فہرست ({employees.length} ممبران)
              </h3>
              <button
                onClick={() => setShowAddEmpModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold font-urdu transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>نیا ملازم شامل کریں</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-urdu text-base">{emp.name}</span>
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      {emp.employeeCode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-urdu">
                    <div>عہدہ: <strong>{emp.role}</strong></div>
                    <div>شعبہ: <strong>{emp.department}</strong></div>
                    <div>فون نمبر: <strong>{emp.phone}</strong></div>
                    <div>ماہانہ بنیادی تنخواہ: <strong>روپے {(emp.monthlySalary || 0).toLocaleString('en-PK')}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BROADCAST ANNOUNCEMENT */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handlePostAnnouncement} className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <h3 className="font-bold text-slate-900 font-urdu text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-700" />
                تمام ملازمین کے لیے نیا اعلان / نوٹس جاری کریں
              </h3>

              {annSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-urdu border border-emerald-200">
                  اعلان کامیابی کے ساتھ تمام ملازمین کے پورٹل پر نشر کر دیا گیا۔
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  اعلان کا عنوان:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="مثال: کل صبح 9 بجے ضروری میٹنگ، اوقات کار کی پابندی..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-urdu"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  اعلان کی تفصیل / پیغام:
                </label>
                <textarea
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="پیغام یہاں لکھیں..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-urdu"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="py-2 px-5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold font-urdu transition"
                >
                  اعلان جاری کریں
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 font-urdu text-sm">حالیہ جاری کردہ اعلانات:</h4>
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 border border-slate-200 rounded-xl bg-white space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 font-urdu">{ann.title}</span>
                    <span className="text-slate-400 font-mono">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-urdu">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: OFFICE & SHIFT SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="max-w-xl space-y-4 border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="font-bold text-slate-900 font-urdu text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-700" />
              ڈیوٹی اوقات اور ہیڈ آفس ترتیبات
            </h3>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-urdu border border-emerald-200">
                ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                ادارے / کمپنی کا نام:
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-urdu"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  ڈیوٹی شروع کا وقت:
                </label>
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                  ڈیوٹی اختتام کا وقت:
                </label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">
                تاخیر کی گنجائش (منٹ میں):
              </label>
              <input
                type="number"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
              />
              <span className="text-[11px] text-slate-500 font-urdu mt-0.5 block">
                مقررہ وقت کے بعد اتنے منٹ تک حاضر، اس کے بعد تاخیر (Late) لگے گی۔
              </span>
            </div>

            <button
              type="submit"
              className="py-2 px-5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold font-urdu transition"
            >
              ترتیبات محفوظ کریں
            </button>
          </form>
        )}
      </div>

      {/* Manual Mark Modal */}
      {manualEmpId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-xl space-y-4 text-right">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-slate-900 font-urdu">حاضری میں دستی ترمیم (ہیڈ اختیار)</h4>
              <button onClick={() => setManualEmpId(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualAttendance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">کیفیت (Status):</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as AttendanceRecord['status'])}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-urdu"
                >
                  <option value="present">حاضر (Present)</option>
                  <option value="late">تاخیر (Late)</option>
                  <option value="leave">رخصت (Leave)</option>
                  <option value="absent">غیر حاضر (Absent)</option>
                  <option value="half-day">آدھا دن (Half Day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 font-urdu">آمد وقت:</label>
                  <input
                    type="time"
                    step="1"
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-urdu">چھٹی وقت:</label>
                  <input
                    type="time"
                    step="1"
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-urdu">ریمارکس / وجہ:</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="ہیڈ ریمارکس..."
                  className="w-full px-3 py-1.5 border rounded-lg text-xs font-urdu"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold font-urdu"
                >
                  محفوظ کریں
                </button>
                <button
                  type="button"
                  onClick={() => setManualEmpId(null)}
                  className="py-2 px-4 bg-slate-100 rounded-xl text-xs font-urdu"
                >
                  منسوخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-xl space-y-4 text-right">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-slate-900 font-urdu">نیا ملازم رجسٹر کریں</h4>
              <button onClick={() => setShowAddEmpModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">ملازم کا مکمل نام:</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="مثال: راشد علی"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-urdu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">عہدہ / پوسٹ:</label>
                  <input
                    type="text"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="مثال: ڈرائیور / کلرک"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-urdu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">ملازم کوڈ:</label>
                  <input
                    type="text"
                    value={newEmpCode}
                    onChange={(e) => setNewEmpCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">موبائل فون:</label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-urdu">ماہانہ تنخواہ:</label>
                  <input
                    type="number"
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(e.target.value)}
                    placeholder="45000"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold font-urdu"
                >
                  ملازم شامل کریں
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="py-2 px-4 bg-slate-100 rounded-xl text-xs font-urdu"
                >
                  منسوخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
