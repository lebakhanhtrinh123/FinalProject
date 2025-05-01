class Courier {
  final String employeeId;
  final String fullName;
  final String? address;  
  final String email;
  final String phone;
  final bool gender;
  final DateTime birthday;
  final String identificationNumber;
  final String? identificationFontOfPhoto;  
  final String? identificationBackOfPhoto;  
  final String roleName;
  final String storeId;
  final bool status;
  final String? avatar;  
  final String? numberMoto;  
  final String? colorMoto;  
  final String? motoType;  

  Courier({
    required this.employeeId,
    required this.fullName,
    this.address,
    required this.email,
    required this.phone,
    required this.gender,
    required this.birthday,
    required this.identificationNumber,
    this.identificationFontOfPhoto,
    this.identificationBackOfPhoto,
    required this.roleName,
    required this.storeId,
    required this.status,
    this.avatar,
    this.numberMoto,
    this.colorMoto,
    this.motoType,
  });

  factory Courier.fromJson(Map<String, dynamic> json) {
    return Courier(
      employeeId: json['employeeId'],
      fullName: json['fullName'],
      address: json['address'],
      email: json['email'],
      phone: json['phone'],
      gender: json['gender'],
      birthday: DateTime.parse(json['birthday']),
      identificationNumber: json['identificationNumber'],
      identificationFontOfPhoto: json['identificationFontOfPhoto'],
      identificationBackOfPhoto: json['identificationBackOfPhoto'],
      roleName: json['roleName'],
      storeId: json['storeId'],
      status: json['status'],
      avatar: json['avatar'],
      numberMoto: json['numberMoto'],  // Lấy giá trị của numberMoto từ JSON
      colorMoto: json['colorMoto'],    // Lấy giá trị của colorMoto từ JSON
      motoType: json['motoType'],      // Lấy giá trị của motoType từ JSON
    );
  }
}