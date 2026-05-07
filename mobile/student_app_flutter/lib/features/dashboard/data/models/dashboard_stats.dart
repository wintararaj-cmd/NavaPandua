
class DashboardStats {
  final int totalStudents;
  final int totalTeachers;
  final int totalSchools;
  final int totalOrganizations;
  final AttendanceToday attendanceToday;
  final List<AttendanceTrend> attendanceTrend;
  final FinanceStats finance;

  DashboardStats({
    required this.totalStudents,
    required this.totalTeachers,
    required this.totalSchools,
    required this.totalOrganizations,
    required this.attendanceToday,
    required this.attendanceTrend,
    required this.finance,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalStudents: json['total_students'] ?? 0,
      totalTeachers: json['total_teachers'] ?? 0,
      totalSchools: json['total_schools'] ?? 0,
      totalOrganizations: json['total_organizations'] ?? 0,
      attendanceToday: AttendanceToday.fromJson(json['attendance_today'] ?? {}),
      attendanceTrend: (json['attendance_trend'] as List? ?? [])
          .map((e) => AttendanceTrend.fromJson(e))
          .toList(),
      finance: FinanceStats.fromJson(json['finance'] ?? {}),
    );
  }
}

class AttendanceToday {
  final int present;
  final int absent;
  final int late;
  final double percentage;

  AttendanceToday({
    required this.present,
    required this.absent,
    required this.late,
    required this.percentage,
  });

  factory AttendanceToday.fromJson(Map<String, dynamic> json) {
    return AttendanceToday(
      present: json['present'] ?? 0,
      absent: json['absent'] ?? 0,
      late: json['late'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
    );
  }
}

class AttendanceTrend {
  final String date;
  final int present;

  AttendanceTrend({
    required this.date,
    required this.present,
  });

  factory AttendanceTrend.fromJson(Map<String, dynamic> json) {
    return AttendanceTrend(
      date: json['date'] ?? '',
      present: json['present'] ?? 0,
    );
  }
}

class FinanceStats {
  final double monthlyCollection;
  final String currency;

  FinanceStats({
    required this.monthlyCollection,
    required this.currency,
  });

  factory FinanceStats.fromJson(Map<String, dynamic> json) {
    return FinanceStats(
      monthlyCollection: (json['monthly_collection'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'INR',
    );
  }
}
