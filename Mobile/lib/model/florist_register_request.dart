import 'dart:io';

class FloristRegisterRequest {
  String fullName;
  String address;
  String email;
  String phone;
  bool gender;
  DateTime birthday;
  String identificationNumber;
  File? avatar;
  File? identificationFontOfPhoto;
  File? identificationBackOfPhoto;
  String storeId;

  FloristRegisterRequest({
    required this.fullName,
    required this.address,
    required this.email,
    required this.phone,
    required this.gender,
    required this.birthday,
    required this.identificationNumber,
    this.avatar,
    this.identificationFontOfPhoto,
    this.identificationBackOfPhoto,
    required this.storeId,
  });

  // Convert to FormData for multipart request
  Map<String, String> toFormData() {
    return {
      'FullName': fullName,
      'Address': address,
      'Email': email,
      'Phone': phone,
      'Gender': gender.toString(),
      'Birthday': birthday.toIso8601String(),
      'IdentificationNumber': identificationNumber,
    };
  }

  // Factory constructor để tạo object từ JSON response
  factory FloristRegisterRequest.fromJson(Map<String, dynamic> json) {
    return FloristRegisterRequest(
      fullName: json['fullName'] as String,
      address: json['address'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      gender: json['gender'], // Chuyển đổi từ int sang bool
      birthday: DateTime.parse(json['birthday'] as String),
      identificationNumber: json['identificationNumber'] as String,
      storeId: json['storeId'] as String,
    );
  }

  // Method để chuyển object thành JSON
  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'address': address,
      'email': email,
      'phone': phone,
      'gender': gender ? 1 : 0, // Convert bool thành int
      'birthday': birthday.toIso8601String(),
      'identificationNumber': identificationNumber,
      'storeId': storeId,
    };
  }

  // Method để copy object với một số thuộc tính mới
  FloristRegisterRequest copyWith({
    String? fullName,
    String? address,
    String? email,
    String? phone,
    bool? gender,
    DateTime? birthday,
    String? identificationNumber,
    File? avatar,
    File? identificationFontOfPhoto,
    File? identificationBackOfPhoto,
    String? storeId,
  }) {
    return FloristRegisterRequest(
      fullName: fullName ?? this.fullName,
      address: address ?? this.address,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      gender: gender ?? this.gender,
      birthday: birthday ?? this.birthday,
      identificationNumber: identificationNumber ?? this.identificationNumber,
      avatar: avatar ?? this.avatar,
      identificationFontOfPhoto: identificationFontOfPhoto ?? this.identificationFontOfPhoto,
      identificationBackOfPhoto: identificationBackOfPhoto ?? this.identificationBackOfPhoto,
      storeId: storeId ?? this.storeId,
    );
  }

  @override
  String toString() {
    return 'FloristRegisterRequest(fullName: $fullName, address: $address, email: $email, '
        'phone: $phone, gender: $gender, birthday: $birthday, '
        'identificationNumber: $identificationNumber, storeId: $storeId, '
        'avatar: ${avatar?.path}, '
        'identificationFontOfPhoto: ${identificationFontOfPhoto?.path}, '
        'identificationBackOfPhoto: ${identificationBackOfPhoto?.path})';
  }
}
