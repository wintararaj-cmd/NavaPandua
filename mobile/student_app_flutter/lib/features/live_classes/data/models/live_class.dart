
class LiveClass {
  final String id;
  final String title;
  final String subjectName;
  final String teacherName;
  final String startTime;
  final String endTime;
  final String meetingUrl;
  final String status; // UPCOMING, LIVE, COMPLETED

  LiveClass({
    required this.id,
    required this.title,
    required this.subjectName,
    required this.teacherName,
    required this.startTime,
    required this.endTime,
    required this.meetingUrl,
    required this.status,
  });

  factory LiveClass.fromJson(Map<String, dynamic> json) {
    return LiveClass(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      subjectName: json['subject_name'] ?? '',
      teacherName: json['teacher_name'] ?? '',
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      meetingUrl: json['meeting_url'] ?? '',
      status: json['status'] ?? 'UPCOMING',
    );
  }
}
