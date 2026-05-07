import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import 'auth_remote_data_source.dart';
import 'user_model.dart';

class AuthRepository {
  final AuthRemoteDataSource _dataSource;
  final SharedPreferences _prefs;

  AuthRepository(this._dataSource, this._prefs);

  Future<UserModel> login(String email, String password) async {
    final response = await _dataSource.login(email, password);

    // Save tokens and user
    await _prefs.setString('access_token', response.data.tokens.access);
    await _prefs.setString('refresh_token', response.data.tokens.refresh);
    await _prefs.setString('user', jsonEncode(response.data.user.toJson()));

    return response.data.user;
  }

  Future<void> logout() async {
    await _prefs.remove('access_token');
    await _prefs.remove('refresh_token');
    await _prefs.remove('user');
  }

  UserModel? getUser() {
    final userStr = _prefs.getString('user');
    if (userStr != null) {
      return UserModel.fromJson(jsonDecode(userStr));
    }
    return null;
  }

  bool isLoggedIn() {
    return _prefs.containsKey('access_token');
  }
}
