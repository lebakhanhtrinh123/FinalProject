import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flowerops/model/store.dart';
import 'package:http/http.dart' as http;
import 'package:flowerops/model/store_overviewResponse.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StoreService {
  final String apiLink =
      "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api";

  Future<List<Store>> getAllStores() async {
    try {
      final response = await http.get(
        Uri.parse('$apiLink/Store/GetAllStore'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['data'] != null) {
          return (responseData['data'] as List)
              .map((store) => Store.fromJson(store))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching stores: $e');
      return [];
    }
  }

  Future<StoreOverviewResponse> getStoreOverview({String? view}) async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? storeId = prefs.getString('storedId');

      // Fetch revenue data
      final revenueResponse = await http.get(
        Uri.parse('$apiLink/Revenue/GetRevenueByStoreId?storeId=$storeId'),
      );

      // Fetch loss data
      final lossResponse = await http.get(
        Uri.parse('$apiLink/Revenue/GetLossByStoreId?storeId=$storeId'),
      );

      if (revenueResponse.statusCode == 200 && lossResponse.statusCode == 200) {
        final revenueData = json.decode(revenueResponse.body)['data'];
        final lossData = json.decode(lossResponse.body)['data'];

        // Calculate total revenue, loss and profit
        double totalRevenue = 0;
        double totalLoss = 0;
        List<MonthlyData> monthlyData = [];

        // List of month names
        final months = [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december'
        ];

        // Convert to short month names for display
        final shortMonths = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];

        // Get current month (0-based index)
        final int currentMonthIndex = DateTime.now().month - 1;

        // Process monthly data based on view parameter
        if (view == 'year') {
          // For year view, only add months that have data
          for (int i = 0; i < months.length; i++) {
            final String monthKey = months[i];
            final double revenue =
                (revenueData[monthKey] as num?)?.toDouble() ?? 0.0;
            final double loss = (lossData[monthKey] as num?)?.toDouble() ?? 0.0;

            // Only add months that have revenue or loss data
            if (revenue > 0 || loss > 0) {
              final double profit = revenue - loss;

              totalRevenue += revenue;
              totalLoss += loss;

              monthlyData.add(MonthlyData(
                month: shortMonths[i],
                investment: revenue, // We don't have investment data from API
                loss: loss,
                profit: profit,
              ));
            }
          }
        } else {
          // For month view (default), only show current month
          final String currentMonthKey = months[currentMonthIndex];
          final double revenue =
              (revenueData[currentMonthKey] as num?)?.toDouble() ?? 0.0;
          final double loss =
              (lossData[currentMonthKey] as num?)?.toDouble() ?? 0.0;
          final double profit = revenue - loss;

          totalRevenue = revenue;
          totalLoss = loss;

          monthlyData.add(MonthlyData(
            month: shortMonths[currentMonthIndex],
            investment: revenue, 
            loss: loss,
            profit: profit,
          ));
        }

        double totalProfit = totalRevenue - totalLoss;

        // For total orders, you might need another API call or you can use a default value
        int totalOrders = 120; // Default value

        return StoreOverviewResponse(
          totalEarning: totalProfit,
          totalOrders: totalOrders,
          totalRevenue: totalRevenue,
          totalLoss: totalLoss,
          totalProfit: totalProfit,
          monthlyData: monthlyData,
        );
      } else {
        throw Exception('Failed to load data from API');
      }
    } catch (e) {
      print('Error fetching store overview: $e');

      // Return empty data with proper structure instead of mock data
      return StoreOverviewResponse(
        totalEarning: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalLoss: 0,
        totalProfit: 0,
        monthlyData: [],
      );
    }
  }
}
