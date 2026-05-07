
import '../../../core/network/api_client.dart';
import 'models/attendance.dart';

class AttendanceRepository {
  final ApiClient _apiClient;

  AttendanceRepository(this._apiClient);

  Future<AttendanceSummary> getAttendanceSummary() async {
    try {
      final response = await _apiClient.get('/attendance/student-stats/');
      return AttendanceSummary.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<AttendanceRecord>> getAttendanceHistory() async {
    try {
      final response = await _apiClient.get('/attendance/student-history/');
      return (response.data as List)
          .map((e) => AttendanceRecord.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }
}
