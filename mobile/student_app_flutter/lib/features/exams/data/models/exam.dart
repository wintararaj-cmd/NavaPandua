
class Exam {
  final String id;
  final String title;
  final String startDate;
  final String endDate;
  final String status; // UPCOMING, ONGOING, COMPLETED

  Exam({
    required this.id,
    required this.title,
    required this.startDate,
    required this.endDate,
    required this.status,
  });

  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      startDate: json['start_date'] ?? '',
      endDate: json['end_date'] ?? '',
      status: json['status'] ?? 'UPCOMING',
    );
  }
}

class ExamResult {
  final String subjectName;
  final double marksObtained;
  final double maxMarks;
  final String grade;
  final String remarks;

  ExamResult({
    required this.subjectName,
    required this.marksObtained,
    required this.maxMarks,
    required this.grade,
    required this.remarks,
  });

  factory ExamResult.fromJson(Map<String, dynamic> json) {
    return ExamResult(
      subjectName: json['subject_name'] ?? '',
      marksObtained: (json['marks_obtained'] ?? 0).toDouble(),
      maxMarks: (json['max_marks'] ?? 0).toDouble(),
      grade: json['grade'] ?? 'N/A',
      remarks: json['remarks'] ?? '',
    );
  }
}

class ReportCard {
  final String examTitle;
  final List<ExamResult> results;
  final double totalPercentage;
  final String overallGrade;
  final String resultStatus; // PASS, FAIL

  ReportCard({
    required this.examTitle,
    required this.results,
    required this.totalPercentage,
    required this.overallGrade,
    required this.resultStatus,
  });

  factory ReportCard.fromJson(Map<String, dynamic> json) {
    return ReportCard(
      examTitle: json['exam_title'] ?? '',
      results: (json['results'] as List? ?? [])
          .map((e) => ExamResult.fromJson(e))
          .toList(),
      totalPercentage: (json['total_percentage'] ?? 0).toDouble(),
      overallGrade: json['overall_grade'] ?? 'N/A',
      resultStatus: json['result_status'] ?? 'PENDING',
    );
  }
}
