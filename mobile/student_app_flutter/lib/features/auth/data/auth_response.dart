import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'auth_response.g.dart';

@JsonSerializable()
class AuthResponse {
  final bool success;
  final String message;
  final AuthData data;

  AuthResponse({
    required this.success,
    required this.message,
    required this.data,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class AuthData {
  @JsonKey(name: 'user')
  final UserModel user;
  @JsonKey(name: 'tokens')
  final Tokens tokens;

  AuthData({required this.user, required this.tokens});

  factory AuthData.fromJson(Map<String, dynamic> json) =>
      _$AuthDataFromJson(json);
  Map<String, dynamic> toJson() => _$AuthDataToJson(this);
}

@JsonSerializable()
class Tokens {
  final String access;
  final String refresh;

  Tokens({required this.access, required this.refresh});

  factory Tokens.fromJson(Map<String, dynamic> json) => _$TokensFromJson(json);
  Map<String, dynamic> toJson() => _$TokensToJson(this);
}
