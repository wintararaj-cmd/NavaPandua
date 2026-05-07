
import '../../../core/network/api_client.dart';
import 'models/exam.dart';

class ExamRepository {
  final ApiClient _apiClient;

  ExamRepository(this._apiClient);

  Future<List<Exam>> getExams() async {
    try {
      final response = await _apiClient.get('/exams/');
      return (response.data['results'] as List)
          .map((e) => Exam.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<ReportCard> getReportCard(String examId) async {
    try {
      final response = await _apiClient.get('/exams/$examId/report-card/');
      return ReportCard.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
