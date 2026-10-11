export type AttendanceStatus = 'present' | 'late' | 'half-day' | 'leave' | 'absent' | 'holiday';

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  employeeCode: string;
  avatar?: string;
  joinDate: string;
  department: string;
  monthlySalary?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  workHours?: number; // in hours (e.g. 8.5)
  notes?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  deviceInfo?: string;
  isManualEntry?: boolean;
  markedByHead?: boolean;
  syncedToServer: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'casual' | 'sick' | 'emergency' | 'annual' | 'unpaid';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface HeadSettings {
  officeName: string;
  shiftStartTime: string; // e.g. "09:00"
  shiftEndTime: string; // e.g. "17:00"
  lateGraceMinutes: number; // e.g. 15
  halfDayHours: number; // e.g. 4
  weeklyOffDays: number[]; // 0 for Sunday, 6 for Saturday
  officeLocation?: {
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  headPin: string; // quick protection for head dashboard
}

export interface HeadAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
  priority: 'normal' | 'important' | 'urgent';
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalDaysInMonth: number;
  workingDaysExpected: number;
  dutyDaysCompleted: number;
  leaveDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalWorkingHours: number;
  attendancePercentage: number;
}
