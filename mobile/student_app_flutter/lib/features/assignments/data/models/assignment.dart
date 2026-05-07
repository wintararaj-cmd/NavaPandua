
class Assignment {
  final String id;
  final String title;
  final String subjectName;
  final String teacherName;
  final String dueDate;
  final String description;
  final String? fileUrl;
  final String status; // PENDING, SUBMITTED, GRADED
  final double? marks;
  final String? feedback;

  Assignment({
    required this.id,
    required this.title,
    required this.subjectName,
    required this.teacherName,
    required this.dueDate,
    required this.description,
    this.fileUrl,
    required this.status,
    this.marks,
    this.feedback,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
    return Assignment(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      subjectName: json['subject_name'] ?? '',
      teacherName: json['teacher_name'] ?? '',
      dueDate: json['due_date'] ?? '',
      description: json['description'] ?? '',
      fileUrl: json['file_url'],
      status: json['status'] ?? 'PENDING',
      marks: json['marks'] != null ? (json['marks'] as num).toDouble() : null,
      feedback: json['feedback'],
    );
  }
}
