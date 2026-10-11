import { Employee, AttendanceRecord, LeaveRequest, HeadSettings, HeadAnnouncement, MonthlySummary, AttendanceStatus } from '../types/attendance';

const STORAGE_KEYS = {
  EMPLOYEES: 'hazri_app_employees_v1',
  RECORDS: 'hazri_app_records_v1',
  LEAVES: 'hazri_app_leaves_v1',
  SETTINGS: 'hazri_app_settings_v1',
  ANNOUNCEMENTS: 'hazri_app_announcements_v1',
  ACTIVE_USER_ID: 'hazri_app_active_user_v1',
  USER_ROLE: 'hazri_app_user_mode_v1', // 'employee' or 'head'
};

const DEFAULT_SETTINGS: HeadSettings = {
  officeName: 'المدینہ ٹریڈرز اینڈ کمپنی',
  shiftStartTime: '09:00',
  shiftEndTime: '17:00',
  lateGraceMinutes: 15,
  halfDayHours: 4,
  weeklyOffDays: [0], // Sunday
  officeLocation: {
    name: 'مین برانچ ہیڈ آفس',
    latitude: 31.5204,
    longitude: 74.3587,
    radiusMeters: 500,
  },
  headPin: '1234',
};

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'محمد علی خان',
    role: 'سینئر سپروائزر',
    phone: '0300-1234567',
    employeeCode: 'EMP-101',
    joinDate: '2024-01-15',
    department: 'آپریشنز',
    monthlySalary: 65000,
  },
  {
    id: 'emp-2',
    name: 'عثمان غنی',
    role: 'فیلڈ آفیسر',
    phone: '0321-9876543',
    employeeCode: 'EMP-102',
    joinDate: '2024-03-01',
    department: 'فیلڈ ٹیم',
    monthlySalary: 45000,
  },
  {
    id: 'emp-3',
    name: 'زینب بی بی',
    role: 'اکاؤنٹس اسسٹنٹ',
    phone: '0333-5551234',
    employeeCode: 'EMP-103',
    joinDate: '2024-06-10',
    department: 'حسابات',
    monthlySalary: 50000,
  },
  {
    id: 'emp-4',
    name: 'حمزہ ریاض',
    role: 'سیکیورٹی انچارج',
    phone: '0345-4433221',
    employeeCode: 'EMP-104',
    joinDate: '2023-11-20',
    department: 'سیکیورٹی',
    monthlySalary: 38000,
  },
  {
    id: 'emp-5',
    name: 'بلال احمد',
    role: 'ڈرائیور / ترسیل کار',
    phone: '0312-7788990',
    employeeCode: 'EMP-105',
    joinDate: '2024-08-01',
    department: 'لاجسٹکس',
    monthlySalary: 35000,
  },
];

// Helper to generate realistic past attendance for current month so statistics are rich immediately
function generateSeedRecords(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const todayDateNum = today.getDate();

  employees.forEach((emp, empIdx) => {
    // Generate records for past days of current month up to yesterday
    for (let day = 1; day <= Math.min(todayDateNum, 28); day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Sunday is weekly off
      if (dayOfWeek === 0) {
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: 'holiday',
          notes: 'اتوار - ہفتہ وار چھٹی',
          syncedToServer: true,
        });
        continue;
      }

      // If it's today, leave it empty or mark first employee as present today
      if (day === todayDateNum) {
        if (empIdx === 0) {
          records.push({
            id: `rec-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            checkInTime: '08:52:10',
            status: 'present',
            notes: 'بروقت حاضری - مین آفس',
            syncedToServer: true,
          });
        } else if (empIdx === 1) {
          records.push({
            id: `rec-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            checkInTime: '09:28:40',
            status: 'late',
            notes: 'ٹریفک کی وجہ سے تاخیر',
            syncedToServer: true,
          });
        }
        continue;
      }

      // Past days distribution: mostly present, occasional leave or absent
      const patternKey = (day + empIdx * 3) % 15;
      if (patternKey === 4) {
        // Leave
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: 'leave',
          notes: 'بیماری کی رخصت (منظور شدہ)',
          syncedToServer: true,
        });
      } else if (patternKey === 9 && empIdx > 1) {
        // Absent
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: 'absent',
          notes: 'بغیر اطلاع غیر حاضر',
          syncedToServer: true,
        });
      } else if (patternKey === 7) {
        // Late
        const checkIn = `09:${String(16 + (day % 15)).padStart(2, '0')}:22`;
        const checkOut = '17:15:00';
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status: 'late',
          workHours: 7.8,
          notes: 'معمولی تاخیر',
          syncedToServer: true,
        });
      } else {
        // Present
        const checkIn = `08:${String(45 + (day % 12)).padStart(2, '0')}:15`;
        const checkOut = `17:${String(5 + (day % 20)).padStart(2, '0')}:00`;
        records.push({
          id: `rec-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          status: 'present',
          workHours: 8.2,
          notes: 'معمول کے اوقات',
          syncedToServer: true,
        });
      }
    }
  });

  return records;
}

const DEFAULT_ANNOUNCEMENTS: HeadAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'روزانہ بروقت حاضری کی پابندی',
    message: 'تمام اسٹاف ممبران کو مطلع کیا جاتا ہے کہ ڈیوٹی کا وقت صبح 9 بجے ہے۔ 9:15 کے بعد آنے والے کو تاخیر (لیٹ) شمار کیا جائے گا۔',
    date: '2026-10-01',
    author: 'ہیڈ آفس ایڈمنسٹریٹر',
    priority: 'important',
  },
  {
    id: 'ann-2',
    title: 'آن لائن پورٹل پر حاضری کا نفاذ',
    message: 'تمام ملازمین اپنی روزانہ کی حاضری اس پورٹل یا موبائل ایپ پر لازمی لگائیں تاکہ مہینے کے آخر میں تنخواہ اور ڈیوٹی کا حساب شفاف رہے۔',
    date: '2026-10-05',
    author: 'ہیڈ آفس ایڈمنسٹریٹر',
    priority: 'normal',
  },
];

export class AttendanceService {
  // Get all employees
  static getEmployees(): Employee[] {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_EMPLOYEES;
    }
  }

  // Save employees
  static saveEmployees(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  // Add employee
  static addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const list = this.getEmployees();
    const newEmp: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
    };
    list.push(newEmp);
    this.saveEmployees(list);
    return newEmp;
  }

  // Get active selected employee
  static getActiveEmployeeId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (active) return active;
    const employees = this.getEmployees();
    const defaultId = employees[0]?.id || 'emp-1';
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, defaultId);
    return defaultId;
  }

  static setActiveEmployeeId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  }

  // Get user role / mode: 'employee' or 'head'
  static getUserRole(): 'employee' | 'head' {
    const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return role === 'head' ? 'head' : 'employee';
  }

  static setUserRole(role: 'employee' | 'head'): void {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  }

  // Get Settings
  static getSettings(): HeadSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: HeadSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Get all Attendance Records
  static getAttendanceRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!data) {
      const seed = generateSeedRecords(this.getEmployees());
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }

  // Get record for specific employee and date (YYYY-MM-DD)
  static getRecordForDate(employeeId: string, dateStr: string): AttendanceRecord | undefined {
    const records = this.getAttendanceRecords();
    return records.find(r => r.employeeId === employeeId && r.date === dateStr);
  }

  // Check In action
  static checkIn(
    employeeId: string,
    options?: {
      location?: { latitude: number; longitude: number; address?: string };
      notes?: string;
    }
  ): { success: boolean; message: string; record: AttendanceRecord } {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) {
      throw new Error('ملازم کا ریکارڈ نہیں ملا');
    }

    const todayStr = this.getFormattedDate(new Date());
    const existing = this.getRecordForDate(employeeId, todayStr);

    if (existing && existing.checkInTime) {
      return {
        success: false,
        message: 'آپ کی آج کی حاضری پہلے سے درج ہے۔',
        record: existing,
      };
    }

    const now = new Date();
    const timeStr = this.getFormattedTime(now);
    const settings = this.getSettings();

    // Determine status based on shift start time & grace minutes
    const status = this.determineAttendanceStatus(now, settings);

    const record: AttendanceRecord = {
      id: existing?.id || `rec-${employeeId}-${todayStr}`,
      employeeId,
      employeeName: emp.name,
      date: todayStr,
      checkInTime: timeStr,
      status,
      notes: options?.notes || (status === 'late' ? 'تاخیر سے آمد' : 'بروقت حاضری'),
      location: options?.location,
      deviceInfo: navigator.userAgent.substring(0, 50),
      syncedToServer: true,
    };

    const allRecords = this.getAttendanceRecords().filter(
      r => !(r.employeeId === employeeId && r.date === todayStr)
    );
    allRecords.unshift(record);
    this.saveAttendanceRecords(allRecords);

    return {
      success: true,
      message: status === 'late' ? 'حاضری لگ گئی (تاخیر)' : 'حاضری کامیابی سے لگ گئی!',
      record,
    };
  }

  // Check Out action
  static checkOut(
    employeeId: string,
    options?: { notes?: string }
  ): { success: boolean; message: string; record: AttendanceRecord } {
    const todayStr = this.getFormattedDate(new Date());
    const existing = this.getRecordForDate(employeeId, todayStr);

    if (!existing || !existing.checkInTime) {
      throw new Error('پہلے حاضری لگائیں (Check-In)، اس کے بعد چھٹی کا وقت درج کریں۔');
    }

    if (existing.checkOutTime) {
      return {
        success: false,
        message: 'چھٹی کا وقت پہلے ہی درج ہو چکا ہے۔',
        record: existing,
      };
    }

    const now = new Date();
    const checkOutTimeStr = this.getFormattedTime(now);

    // Calculate working hours
    const hours = this.calculateWorkHours(existing.checkInTime, checkOutTimeStr);

    const updatedRecord: AttendanceRecord = {
      ...existing,
      checkOutTime: checkOutTimeStr,
      workHours: hours,
      notes: options?.notes ? `${existing.notes ? existing.notes + ' | ' : ''}${options.notes}` : existing.notes,
      syncedToServer: true,
    };

    const allRecords = this.getAttendanceRecords().map(r =>
      r.id === updatedRecord.id ? updatedRecord : r
    );
    this.saveAttendanceRecords(allRecords);

    return {
      success: true,
      message: `چھٹی کا وقت درج ہو گیا۔ کل ڈیوٹی: ${hours} گھنٹے`,
      record: updatedRecord,
    };
  }

  // Head manual mark
  static headMarkAttendance(
    employeeId: string,
    dateStr: string,
    status: AttendanceStatus,
    checkInTime?: string,
    checkOutTime?: string,
    notes?: string
  ): AttendanceRecord {
    const employees = this.getEmployees();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) throw new Error('ملازم موجود نہیں ہے');

    const workHours = (checkInTime && checkOutTime) ? this.calculateWorkHours(checkInTime, checkOutTime) : undefined;

    const record: AttendanceRecord = {
      id: `rec-${employeeId}-${dateStr}`,
      employeeId,
      employeeName: emp.name,
      date: dateStr,
      status,
      checkInTime,
      checkOutTime,
      workHours,
      notes: notes || 'ہیڈ کی طرف سے درج کیا گیا',
      isManualEntry: true,
      markedByHead: true,
      syncedToServer: true,
    };

    const allRecords = this.getAttendanceRecords().filter(
      r => !(r.employeeId === employeeId && r.date === dateStr)
    );
    allRecords.unshift(record);
    this.saveAttendanceRecords(allRecords);
    return record;
  }

  // Leave Requests
  static getLeaveRequests(): LeaveRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static submitLeaveRequest(
    employeeId: string,
    leaveType: LeaveRequest['leaveType'],
    startDate: string,
    endDate: string,
    reason: string
  ): LeaveRequest {
    const emp = this.getEmployees().find(e => e.id === employeeId);
    if (!emp) throw new Error('ملازم نہیں ملا');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate,
      daysCount: days,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const list = this.getLeaveRequests();
    list.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(list));
    return newReq;
  }

  static reviewLeaveRequest(
    leaveId: string,
    action: 'approved' | 'rejected',
    reviewNotes?: string
  ): void {
    const list = this.getLeaveRequests();
    const req = list.find(l => l.id === leaveId);
    if (!req) return;

    req.status = action;
    req.reviewedAt = new Date().toISOString();
    req.reviewNotes = reviewNotes;
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(list));

    // If approved, create attendance record with 'leave' for those days
    if (action === 'approved') {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const cur = new Date(start);

      while (cur <= end) {
        const dateStr = this.getFormattedDate(cur);
        this.headMarkAttendance(
          req.employeeId,
          dateStr,
          'leave',
          undefined,
          undefined,
          `منظور شدہ رخصت: ${req.reason}`
        );
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  // Announcements
  static getAnnouncements(): HeadAnnouncement[] {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      return DEFAULT_ANNOUNCEMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  }

  static addAnnouncement(title: string, message: string, priority: HeadAnnouncement['priority']): HeadAnnouncement {
    const list = this.getAnnouncements();
    const item: HeadAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      date: this.getFormattedDate(new Date()),
      author: 'ہیڈ آفس',
      priority,
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    return item;
  }

  // Monthly Calculation: "مہینے کے بعد پتہ چلا اتنے دن ڈیوٹی کی ہے اور کتنی چھٹیاں کی ہیں"
  static calculateMonthlySummary(employeeId: string, monthStr: string): MonthlySummary {
    // monthStr format: "YYYY-MM"
    const [yearStr, monthNumStr] = monthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthNumStr, 10) - 1; // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const records = this.getAttendanceRecords().filter(
      r => r.employeeId === employeeId && r.date.startsWith(monthStr)
    );

    let dutyDaysCompleted = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let totalWorkingHours = 0;
    let holidayDays = 0;

    // Check each day of the month up to today or end of month
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const maxDayToCheck = isCurrentMonth ? today.getDate() : daysInMonth;

    for (let d = 1; d <= maxDayToCheck; d++) {
      const dateObj = new Date(year, month, d);
      const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = records.find(r => r.date === dateFormatted);

      if (dateObj.getDay() === 0) {
        holidayDays++;
        continue;
      }

      if (rec) {
        if (rec.status === 'present') {
          dutyDaysCompleted++;
          totalWorkingHours += rec.workHours || 8;
        } else if (rec.status === 'late') {
          dutyDaysCompleted++;
          lateDays++;
          totalWorkingHours += rec.workHours || 7.5;
        } else if (rec.status === 'half-day') {
          dutyDaysCompleted += 0.5;
          halfDays++;
          totalWorkingHours += rec.workHours || 4;
        } else if (rec.status === 'leave') {
          leaveDays++;
        } else if (rec.status === 'absent') {
          absentDays++;
        } else if (rec.status === 'holiday') {
          holidayDays++;
        }
      } else {
        // In past days if no record exists for a working day, count as absent
        if (d < (isCurrentMonth ? today.getDate() : maxDayToCheck + 1)) {
          absentDays++;
        }
      }
    }

    const workingDaysExpected = Math.max(1, maxDayToCheck - holidayDays);
    const attendancePercentage = Math.min(100, Math.round((dutyDaysCompleted / workingDaysExpected) * 100));

    return {
      month: monthStr,
      totalDaysInMonth: daysInMonth,
      workingDaysExpected,
      dutyDaysCompleted,
      leaveDays,
      absentDays,
      lateDays,
      halfDays,
      totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
      attendancePercentage,
    };
  }

  // Today's stats for Head / Admin
  static getTodayHeadStats(dateStr?: string) {
    const targetDate = dateStr || this.getFormattedDate(new Date());
    const employees = this.getEmployees();
    const records = this.getAttendanceRecords().filter(r => r.date === targetDate);

    const totalStaff = employees.length;
    let presentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let absentCount = 0;

    employees.forEach(emp => {
      const rec = records.find(r => r.employeeId === emp.id);
      if (rec) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'late') lateCount++;
        else if (rec.status === 'leave') leaveCount++;
        else if (rec.status === 'absent') absentCount++;
      } else {
        absentCount++;
      }
    });

    return {
      date: targetDate,
      totalStaff,
      presentCount,
      lateCount,
      leaveCount,
      absentCount,
      records,
    };
  }

  // Utility helpers
  static getFormattedDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  static getFormattedTime(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  static determineAttendanceStatus(now: Date, settings: HeadSettings): AttendanceStatus {
    const [startH, startM] = settings.shiftStartTime.split(':').map(Number);
    const shiftStart = new Date(now);
    shiftStart.setHours(startH, startM, 0, 0);

    const graceTime = new Date(shiftStart.getTime() + settings.lateGraceMinutes * 60 * 1000);

    if (now <= graceTime) {
      return 'present';
    } else {
      return 'late';
    }
  }

  static calculateWorkHours(checkIn: string, checkOut: string): number {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = Math.max(0, minutes / 60);
    return Math.round(hours * 10) / 10;
  }
}
