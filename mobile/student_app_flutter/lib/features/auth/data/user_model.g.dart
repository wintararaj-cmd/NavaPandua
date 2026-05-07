// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
  id: (json['id'] as num).toInt(),
  username: json['username'] as String,
  email: json['email'] as String,
  firstName: json['first_name'] as String,
  lastName: json['last_name'] as String,
  fullName: json['full_name'] as String,
  phone: json['phone'] as String?,
  role: json['role'] as String,
  profilePicture: json['profile_picture'] as String?,
);

Map<String, dynamic> _$UserModelToJson(UserModel instance) => <String, dynamic>{
  'id': instance.id,
  'username': instance.username,
  'email': instance.email,
  'first_name': instance.firstName,
  'last_name': instance.lastName,
  'full_name': instance.fullName,
  'phone': instance.phone,
  'role': instance.role,
  'profile_picture': instance.profilePicture,
};
