class StaffResponse {
  final List<Staff> data;
  final dynamic additionalData;
  final String? message;
  final int statusCode;
  final String code;

  StaffResponse({
    required this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory StaffResponse.fromJson(Map<String, dynamic> json) {
    return StaffResponse(
      data: (json['data'] as List).map((item) => Staff.fromJson(item)).toList(),
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  }
}

class UpdateOrderResponse {
  final String data;
  final dynamic additionalData;
  final String? message;
  final int statusCode;
  final String code;

  UpdateOrderResponse({
    required this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory UpdateOrderResponse.fromJson(Map<String, dynamic> json) {
    return UpdateOrderResponse(
      data: json['data'],
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  }
}

class Staff {
  final String employeeId;
  final String fullName;
  final String? address;
  final String email;
  final String? phone;
  final bool? gender;
  final String? birthday;
  final String? identificationNumber;
  final String? identificationFontOfPhoto;
  final String? identificationBackOfPhoto;
  final String? roleName;
  final String? storeId;
  final bool? status;
  final String? avatar;

  Staff({
    required this.employeeId,
    required this.fullName,
    this.address,
    required this.email,
    this.phone,
    this.gender,
    this.birthday,
    this.identificationNumber,
    this.identificationFontOfPhoto,
    this.identificationBackOfPhoto,
    this.roleName,
    this.storeId,
    this.status,
    this.avatar,
  });

  factory Staff.fromJson(Map<String, dynamic> json) {
    return Staff(
      employeeId: json['employeeId'],
      fullName: json['fullName'],
      address: json['address'],
      email: json['email'],
      phone: json['phone'],
      gender: json['gender'] as bool?,
      birthday: json['birthday'],
      identificationNumber: json['identificationNumber'],
      identificationFontOfPhoto: json['identificationFontOfPhoto'],
      identificationBackOfPhoto: json['identificationBackOfPhoto'],
      roleName: json['roleName'],
      storeId: json['storeId'],
      status: json['status'] as bool?,
      avatar: json['avatar'],
    );
  }
}