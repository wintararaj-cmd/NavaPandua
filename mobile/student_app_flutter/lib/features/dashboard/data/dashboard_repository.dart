
import '../../../core/network/api_client.dart';
import 'models/dashboard_stats.dart';

class DashboardRepository {
  final ApiClient _apiClient;

  DashboardRepository(this._apiClient);

  Future<DashboardStats> getDashboardStats() async {
    try {
      final response = await _apiClient.get('/analytics/dashboard/stats/');
      if (response.data['success'] == true) {
        return DashboardStats.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to load stats');
      }
    } catch (e) {
      rethrow;
    }
  }
}
