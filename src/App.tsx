import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Shield, 
  Smartphone, 
  Bell, 
  AlertCircle,
  WifiOff,
  Building,
  Heart
} from 'lucide-react';
import { Header } from './components/Header';
import { MarkAttendanceCard } from './components/MarkAttendanceCard';
import { MonthlySummaryCard } from './components/MonthlySummaryCard';
import { HeadDashboard } from './components/HeadDashboard';
import { APKDownloadGuide } from './components/APKDownloadGuide';
import { LeaveRequestModal } from './components/LeaveRequestModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AttendanceService } from './services/attendanceStorage';
import { Employee, HeadSettings } from './types/attendance';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(AttendanceService.getEmployees());
  const [activeEmpId, setActiveEmpId] = useState<string>(AttendanceService.getActiveEmployeeId());
  const [settings, setSettings] = useState<HeadSettings>(AttendanceService.getSettings());
  const [userRole, setUserRole] = useState<'employee' | 'head'>(AttendanceService.getUserRole());
  const [activeTab, setActiveTab] = useState<'attendance' | 'monthly' | 'head' | 'apk'>('attendance');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [announcements, setAnnouncements] = useState(AttendanceService.getAnnouncements());

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Find active employee or fallback to first
  const activeEmployee = employees.find(e => e.id === activeEmpId) || employees[0] || {
    id: 'emp-1',
    name: 'محمد علی خان',
    role: 'سٹاف ممبر',
    phone: '0300-1234567',
    employeeCode: 'EMP-101',
    joinDate: '2024-01-01',
    department: 'جنرل',
    monthlySalary: 45000,
  };

  const handleRoleChange = (role: 'employee' | 'head') => {
    setUserRole(role);
    AttendanceService.setUserRole(role);
    if (role === 'head') {
      setActiveTab('head');
    } else {
      setActiveTab('attendance');
    }
  };

  const handleSelectEmployee = (emp: Employee) => {
    setActiveEmpId(emp.id);
    AttendanceService.setActiveEmployeeId(emp.id);
  };

  const refreshAllData = () => {
    setEmployees(AttendanceService.getEmployees());
    setAnnouncements(AttendanceService.getAnnouncements());
    setSettings(AttendanceService.getSettings());
  };

  // If user role is head, keep head tab highlighted
  useEffect(() => {
    if (userRole === 'head' && activeTab !== 'head') {
      // Allow switching between tabs in head mode too
    }
  }, [userRole, activeTab]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 font-urdu sticky top-0 z-50">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>انٹرنیٹ منقطع ہے۔ پریشان نہ ہوں! حاضری فون میں محفوظ ہو رہی ہے اور نیٹ آنے پر ہیڈ سرور کو چلی جائے گی۔</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentRole={userRole}
        onRoleChange={handleRoleChange}
        settings={settings}
        onOpenInstallModal={() => setShowInstallModal(true)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        activeEmployeeName={activeEmployee.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Urgent Announcement Marquee if any */}
        {announcements.length > 0 && announcements[0]?.priority === 'important' && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold font-urdu ml-1">ہیڈ آفس کا اہم اعلان:</span>
              <span className="font-urdu">{announcements[0].title} — {announcements[0].message}</span>
            </div>
          </div>
        )}

        {/* Primary View Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-bold font-urdu no-print">
          <button
            onClick={() => {
              setActiveTab('attendance');
              setUserRole('employee');
            }}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'attendance'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>حاضری لگائیں (Check-In)</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'monthly'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>مہینے کا حساب و ڈیوٹی</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('head');
              setUserRole('head');
            }}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'head'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>سرور ہیڈ کنٹرول روم</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'apk'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>اینڈرائیڈ APK گائیڈ</span>
          </button>
        </div>

        {/* Tab 1: MARK ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <MarkAttendanceCard
              employees={employees}
              activeEmployee={activeEmployee}
              onSelectEmployee={handleSelectEmployee}
              onOpenLeaveModal={() => setShowLeaveModal(true)}
              onAttendanceUpdated={refreshAllData}
              settings={settings}
              onOpenInstallModal={() => setShowInstallModal(true)}
              isInstalled={isInstalled}
            />

            {/* Quick Monthly Summary Teaser for Current Employee */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 font-urdu text-base">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>اس مہینے کی ڈیوٹی اور چھٹیوں کا فوری خلاصہ</span>
                </div>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className="text-xs font-bold text-blue-700 hover:underline font-urdu"
                >
                  مکمل رپورٹ دیکھیں ←
                </button>
              </div>

              {/* Quick Summary Pill View */}
              {(() => {
                const today = new Date();
                const curMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                const sum = AttendanceService.calculateMonthlySummary(activeEmployee.id, curMonthStr);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                      <span className="text-[11px] text-emerald-800 font-urdu block">ڈیوٹی کے دن</span>
                      <span className="text-xl font-bold font-mono text-emerald-950">{sum.dutyDaysCompleted} دن</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                      <span className="text-[11px] text-amber-800 font-urdu block">کی گئی چھٹیاں</span>
                      <span className="text-xl font-bold font-mono text-amber-950">{sum.leaveDays} دن</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
                      <span className="text-[11px] text-rose-800 font-urdu block">غیر حاضری</span>
                      <span className="text-xl font-bold font-mono text-rose-950">{sum.absentDays} دن</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                      <span className="text-[11px] text-blue-800 font-urdu block">حاضری فیصد</span>
                      <span className="text-xl font-bold font-mono text-blue-950">%{sum.attendancePercentage}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 2: MONTHLY SUMMARY */}
        {activeTab === 'monthly' && (
          <MonthlySummaryCard
            employees={employees}
            activeEmployee={activeEmployee}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {/* Tab 3: SERVER HEAD DASHBOARD */}
        {activeTab === 'head' && (
          <HeadDashboard
            settings={settings}
            onUpdateSettings={setSettings}
            employees={employees}
            onEmployeesUpdated={refreshAllData}
            onAttendanceUpdated={refreshAllData}
          />
        )}

        {/* Tab 4: APK DOWNLOAD GUIDE */}
        {activeTab === 'apk' && (
          <APKDownloadGuide
            onInstall={install}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            isIOS={isIOS}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-urdu no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Hazri Online Attendance System</span>
            <span>•</span>
            <span>مفت آن لائن حاضری اور ہیڈ سرور پورٹل</span>
          </div>

          <div className="flex items-center gap-3">
            <span>اینڈرائیڈ APK سپورٹ</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">100% مفت اور محفوظ</span>
          </div>
        </div>
      </footer>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        employee={activeEmployee}
        onSuccess={() => {
          refreshAllData();
          alert('درخواست کامیابی سے ہیڈ کو بھیج دی گئی۔');
        }}
      />

      {/* PWA / APK Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </div>
  );
}
