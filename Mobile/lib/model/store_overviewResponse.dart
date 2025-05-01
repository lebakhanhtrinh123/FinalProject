class StoreOverviewResponse {
  final double totalEarning;
  final int totalOrders;
  final double totalRevenue;
  final double totalLoss;
  final double totalProfit;
  final List<MonthlyData> monthlyData;

  StoreOverviewResponse({
    required this.totalEarning,
    required this.totalOrders,
    required this.totalRevenue,
    required this.totalLoss,
    required this.totalProfit,
    required this.monthlyData,
  });

  factory StoreOverviewResponse.fromJson(Map<String, dynamic> json) {
    // Extract monthly data
    List<MonthlyData> monthlyDataList = [];
    if (json['monthlyData'] != null) {
      monthlyDataList = List<MonthlyData>.from(
          json['monthlyData'].map((x) => MonthlyData.fromJson(x)));
    }
    
    // Calculate profit if not provided
    double totalProfit = json['totalProfit'] ?? 0;
    if (totalProfit == 0) {
      double revenue = json['totalRevenue'] ?? 0;
      double loss = json['totalLoss'] ?? 0;
      totalProfit = revenue - loss;
    }
    
    return StoreOverviewResponse(
      totalEarning: json['totalEarning'] ?? totalProfit, // Default to totalProfit if not provided
      totalOrders: json['totalOrders'] ?? 0,
      totalRevenue: json['totalRevenue'] ?? 0,
      totalLoss: json['totalLoss'] ?? 0,
      totalProfit: totalProfit,
      monthlyData: monthlyDataList,
    );
  }
}

class MonthlyData {
  final String month;
  final double investment;
  final double loss;
  final double profit;

  MonthlyData({
    required this.month,
    required this.investment,
    required this.loss,
    required this.profit,
  });

  factory MonthlyData.fromJson(Map<String, dynamic> json) {
    // Calculate profit if not provided
    double profit = json['profit'] ?? 0;
    double investment = json['investment'] ?? 0;
    double loss = json['loss'] ?? 0;
    
    if (profit == 0) {
      double revenue = json['revenue'] ?? investment;
      profit = revenue - loss;
    }
    
    return MonthlyData(
      month: json['month'] ?? '',
      investment: investment,
      loss: loss,
      profit: profit,
    );
  }
}