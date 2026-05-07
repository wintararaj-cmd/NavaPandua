import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import 'auth_response.dart';

class AuthRemoteDataSource {
  final ApiClient _apiClient;

  AuthRemoteDataSource(this._apiClient);

  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await _apiClient.post(
        '/auth/login/',
        data: {'email': email, 'password': password},
      );

      return AuthResponse.fromJson(response.data);
    } catch (e) {
      if (e is DioException) {
        if (e.response != null && e.response!.data != null) {
          throw Exception(e.response!.data['message'] ?? 'Login failed');
        }
      }
      rethrow;
    }
  }
}
