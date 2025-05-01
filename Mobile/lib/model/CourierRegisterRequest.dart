import 'dart:io';

class CourierRegisterRequest {
  String fullName;
  String? address; // Có thể null
  String email;
  String phone;
  bool gender;
  DateTime birthday;
  String identificationNumber;
  String numberMoto;
  String colorMoto;
  String motoType;
  File? avatar;
  File? identificationFontOfPhoto;
  File? identificationBackOfPhoto;
  String storeId;

  CourierRegisterRequest({
    required this.fullName,
    this.address,
    required this.email,
    required this.phone,
    required this.gender,
    required this.birthday,
    required this.identificationNumber,
    required this.numberMoto,
    required this.colorMoto,
    required this.motoType,
    this.avatar,
    this.identificationFontOfPhoto,
    this.identificationBackOfPhoto,
    required this.storeId,
  });

  // Chuyển đổi sang FormData cho multipart request
  Map<String, String> toFormData() {
    final Map<String, String> formData = {
      'FullName': fullName,
      'Email': email,
      'Phone': phone,
      'Gender': gender.toString(),
      'Birthday': birthday.toIso8601String(),
      'IdentificationNumber': identificationNumber,
      'NumberMoto': numberMoto,
      'ColorMoto': colorMoto,
      'MotoType': motoType,
    };

    // Chỉ thêm address vào form data nếu không phải null
    if (address != null) {
      formData['Address'] = address!;
    }

    return formData;
  }

  // Phương thức tạo đối tượng từ JSON
  factory CourierRegisterRequest.fromJson(Map<String, dynamic> json) {
    return CourierRegisterRequest(
      fullName: json['fullName'] ?? '',
      address: json['address'],
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      gender: json['gender'] ?? false,
      birthday: json['birthday'] != null 
          ? DateTime.parse(json['birthday'] as String)
          : DateTime.now(),
      identificationNumber: json['identificationNumber'] ?? '',
      numberMoto: json['numberMoto'] ?? '',
      colorMoto: json['colorMoto'] ?? '',
      motoType: json['motoType'] ?? '',
      storeId: json['storeId'] ?? '',
    );
  }

  // Chuyển đối tượng thành JSON
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'gender': gender,
      'birthday': birthday.toIso8601String(),
      'identificationNumber': identificationNumber,
      'numberMoto': numberMoto,
      'colorMoto': colorMoto,
      'motoType': motoType,
      'storeId': storeId,
    };

    // Chỉ thêm address vào JSON nếu không phải null
    if (address != null) {
      data['address'] = address;
    }

    return data;
  }

  // Tạo bản sao với các thuộc tính mới
  CourierRegisterRequest copyWith({
    String? fullName,
    String? address,
    String? email,
    String? phone,
    bool? gender,
    DateTime? birthday,
    String? identificationNumber,
    String? numberMoto,
    String? colorMoto,
    String? motoType,
    File? avatar,
    File? identificationFontOfPhoto,
    File? identificationBackOfPhoto,
    String? storeId,
  }) {
    return CourierRegisterRequest(
      fullName: fullName ?? this.fullName,
      address: address ?? this.address,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      gender: gender ?? this.gender,
      birthday: birthday ?? this.birthday,
      identificationNumber: identificationNumber ?? this.identificationNumber,
      numberMoto: numberMoto ?? this.numberMoto,
      colorMoto: colorMoto ?? this.colorMoto,
      motoType: motoType ?? this.motoType,
      avatar: avatar ?? this.avatar,
      identificationFontOfPhoto: identificationFontOfPhoto ?? this.identificationFontOfPhoto,
      identificationBackOfPhoto: identificationBackOfPhoto ?? this.identificationBackOfPhoto,
      storeId: storeId ?? this.storeId,
    );
  }

  @override
  String toString() {
    return 'CourierRegisterRequest(fullName: $fullName, address: $address, email: $email, '
        'phone: $phone, gender: $gender, birthday: $birthday, '
        'identificationNumber: $identificationNumber, numberMoto: $numberMoto, '
        'colorMoto: $colorMoto, motoType: $motoType, storeId: $storeId, '
        'avatar: ${avatar?.path}, '
        'identificationFontOfPhoto: ${identificationFontOfPhoto?.path}, '
        'identificationBackOfPhoto: ${identificationBackOfPhoto?.path})';
  }
}