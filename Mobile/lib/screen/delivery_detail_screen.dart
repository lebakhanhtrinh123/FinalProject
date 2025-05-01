import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DeliveryDetailScreen extends StatefulWidget {
  final String deliveryId;

  const DeliveryDetailScreen({
    Key? key,
    required this.deliveryId,
  }) : super(key: key);
  @override
  State<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends State<DeliveryDetailScreen> {
  final DeliveryService _deliveryService = DeliveryService();
  bool isLoading = true;
  DeliveryData? deliveryDetail;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadDeliveryDetail();
  }

  Future<void> _loadDeliveryDetail() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final response =
          await _deliveryService.getDeliveryById(widget.deliveryId);
      setState(() {
        deliveryDetail = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.teal[700]),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Details',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('Pickup Location'),
                        _buildLocationContainer(
                          deliveryDetail?.pickupLocation ?? 'Chưa có thông tin',
                          Icons.location_on,
                          Colors.red,
                        ),
                        SizedBox(height: 24),

                        _buildSectionTitle('Delivery Location'),
                        _buildLocationContainer(
                          deliveryDetail?.deliveryLocation ??
                              'Chưa có thông tin',
                          Icons.location_on_outlined,
                          Colors.green,
                        ),
                        SizedBox(height: 24),

                        _buildAmountContainer(
                            deliveryDetail?.fee?.toString() ?? '0'),
                        SizedBox(height: 24),

                        _buildSectionTitle('Recipient Names'),
                        _buildInfoContainer(deliveryDetail?.customerName ??
                            'Chưa có thông tin'),
                        SizedBox(height: 24),

                        _buildSectionTitle('Recipient contact number'),
                        _buildInfoPhone(
                            context,
                            deliveryDetail?.customerPhone ??
                                'Chưa có thông tin'),
                        SizedBox(height: 24),

                        
                        
                        
                          

                        

                        SizedBox(height: 32),

                        // Continue Button
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => DeliveryScreen(
                                    deliveryId: deliveryDetail!.orderId!,
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF006D77),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              'Continue',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 16,
        ),
      ),
    );
  }

  Widget _buildLocationContainer(String text, IconData icon, Color iconColor) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoContainer(String text) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 16,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildInfoPhone(BuildContext context, String text) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 16,
                color: Colors.black87,
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.phone, color: Colors.green),
            onPressed: () async {
              final Uri phoneUri = Uri(scheme: 'tel', path: text);
              if (await canLaunchUrl(phoneUri)) {
                await launchUrl(phoneUri);
              } else {
                // Optional: Show an error if phone cannot be launched
                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Could not launch phone app')));
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAmountContainer(String amount) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Text(
            '\$',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          SizedBox(width: 4),
          Text(
            amount,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

 }
