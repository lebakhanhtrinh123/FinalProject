class Store {
  final String storeId;
  final String storeName;
  final String city;
  final String district;
  final String address;
  final bool status;
  final String storePhone;
  final String storeEmail;

  Store({
    required this.storeId,
    required this.storeName,
    required this.city,
    required this.district,
    required this.address,
    required this.status,
    required this.storePhone,
    required this.storeEmail,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      storeId: json['storeId'],
      storeName: json['storeName'],
      city: json['city'],
      district: json['district'],
      address: json['address'],
      status: json['status'],
      storePhone: json['storePhone'],
      storeEmail: json['storeEmail'],
    );
  }
}