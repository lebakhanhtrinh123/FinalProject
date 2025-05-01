class FlowerArrangementDetail {
  final String requestId;
  final String customerName;
  final String imageUrl;
  final String status;
  final DateTime requestDate;
  final double price;
  final String description;
  final List<FlowerComposition> flowerComposition;
  final String occasion;
  final String style;
  final String size;

  FlowerArrangementDetail({
    required this.requestId,
    required this.customerName,
    required this.imageUrl,
    required this.status,
    required this.requestDate,
    required this.price,
    required this.description,
    required this.flowerComposition,
    required this.occasion,
    required this.style,
    required this.size,
  });
}

class FlowerComposition {
  final String flowerName;
  final int quantity;
  final String color;

  FlowerComposition({
    required this.flowerName,
    required this.quantity,
    required this.color,
  });
}