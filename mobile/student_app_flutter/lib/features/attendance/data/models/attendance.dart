
class AttendanceRecord {
  final String date;
  final String status; // PRESENT, ABSENT, LATE, HALF_DAY
  final String? remarks;

  AttendanceRecord({
    required this.date,
    required this.status,
    this.remarks,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      date: json['date'] ?? '',
      status: json['status'] ?? 'ABSENT',
      remarks: json['remarks'],
    );
  }
}

class AttendanceSummary {
  final int totalDays;
  final int presentDays;
  final int absentDays;
  final int lateDays;
  final double percentage;

  AttendanceSummary({
    required this.totalDays,
    required this.presentDays,
    required this.absentDays,
    required this.lateDays,
    required this.percentage,
  });

  factory AttendanceSummary.fromJson(Map<String, dynamic> json) {
    return AttendanceSummary(
      totalDays: json['total_days'] ?? 0,
      presentDays: json['present_days'] ?? 0,
      absentDays: json['absent_days'] ?? 0,
      lateDays: json['late_days'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
    );
  }
}
