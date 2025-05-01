class FlowerArrangementData {
  final String requestId;
  final String customerName;
  final String imageUrl;
  final String status;
  final DateTime requestDate;
  final double price;

  FlowerArrangementData({
    required this.requestId,
    required this.customerName,
    required this.imageUrl,
    required this.status,
    required this.requestDate,
    required this.price,
  });

  factory FlowerArrangementData.fromJson(Map<String, dynamic> json) {
    return FlowerArrangementData(
      requestId: json['requestId'],
      customerName: json['customerName'],
      imageUrl: json['imageUrl'],
      status: json['status'],
      requestDate: DateTime.parse(json['requestDate']),
      price: json['price'].toDouble(),
    );
  }
}