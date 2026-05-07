
import '../../../core/network/api_client.dart';
import 'models/assignment.dart';

class AssignmentRepository {
  final ApiClient _apiClient;

  AssignmentRepository(this._apiClient);

  Future<List<Assignment>> getAssignments() async {
    try {
      final response = await _apiClient.get('/assignments/');
      return (response.data['results'] as List)
          .map((e) => Assignment.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> submitAssignment(String assignmentId, String submissionUrl) async {
    try {
      await _apiClient.post('/assignments/$assignmentId/submit/', data: {
        'submission_url': submissionUrl,
      });
    } catch (e) {
      rethrow;
    }
  }

  // Teacher Methods
  Future<void> createAssignment(Map<String, dynamic> data) async {
    try {
      await _apiClient.post('/assignments/', data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getSubmissions(String assignmentId) async {
    try {
      final response = await _apiClient.get('/assignments/$assignmentId/submissions/');
      return response.data['results'] ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> gradeSubmission(String submissionId, double marks, String feedback) async {
    try {
      await _apiClient.post('/assignments/submissions/$submissionId/grade/', data: {
        'marks_obtained': marks,
        'teacher_feedback': feedback,
      });
    } catch (e) {
      rethrow;
    }
  }
}
