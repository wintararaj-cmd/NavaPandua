// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) => AuthResponse(
  success: json['success'] as bool,
  message: json['message'] as String,
  data: AuthData.fromJson(json['data'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AuthResponseToJson(AuthResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'data': instance.data,
    };

AuthData _$AuthDataFromJson(Map<String, dynamic> json) => AuthData(
  user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
  tokens: Tokens.fromJson(json['tokens'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AuthDataToJson(AuthData instance) => <String, dynamic>{
  'user': instance.user,
  'tokens': instance.tokens,
};

Tokens _$TokensFromJson(Map<String, dynamic> json) => Tokens(
  access: json['access'] as String,
  refresh: json['refresh'] as String,
);

Map<String, dynamic> _$TokensToJson(Tokens instance) => <String, dynamic>{
  'access': instance.access,
  'refresh': instance.refresh,
};
