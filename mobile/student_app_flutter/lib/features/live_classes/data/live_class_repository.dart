
import '../../../core/network/api_client.dart';
import 'models/live_class.dart';

class LiveClassRepository {
  final ApiClient _apiClient;

  LiveClassRepository(this._apiClient);

  Future<List<LiveClass>> getLiveClasses() async {
    try {
      final response = await _apiClient.get('/live-classes/');
      return (response.data['results'] as List)
          .map((e) => LiveClass.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }
}
