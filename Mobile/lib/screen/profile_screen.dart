import 'dart:io';

import 'package:flowerops/screen/delivery_home_screen.dart';
import 'package:flowerops/screen/login_screen.dart';
import 'package:flowerops/screen/personal_information_screen.dart';
import 'package:flowerops/screen/staff_list_order_screen.dart';
import 'package:flowerops/screen/store_overview_screen.dart';
import 'package:flowerops/services/account_service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AccountService accountService = AccountService();
  File? _avatarImage;
  int _selectedIndex = 1;

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        _avatarImage = File(image.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Profile'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24),
            // Avatar with edit button
            Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFFEEF1F4),
                    image: _avatarImage != null
                        ? DecorationImage(
                            image: FileImage(_avatarImage!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: _avatarImage == null
                      ? const CircleAvatar(
                          radius: 60,
                          backgroundColor: Color(0xFF98CDC9),
                          child: Text(
                            'DE',
                            style: TextStyle(
                              fontSize: 40,
                              color: Colors.black54,
                            ),
                          ),
                        )
                      : null,
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF006A60),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.edit,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Davidson Edgar',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 32),

            // Menu Items
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  // Basic Information
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    title: 'Personal Information',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PersonalInformationScreen(),
                        ),
                      );
                      // TODO: Navigate to basic information screen
                    },
                  ),
                  const Divider(),

                  // Vehicle Information
                  _buildMenuItem(
                    icon: Icons.directions_car_outlined,
                    title: 'Vehicle',
                    onTap: () {
                      // TODO: Navigate to vehicle information screen
                    },
                  ),
                  const Divider(),

                  // Delivery History
                  _buildMenuItem(
                    icon: Icons.history,
                    title: 'Delivery History',
                    onTap: () {
                      // TODO: Navigate to delivery history screen
                    },
                  ),
                  const Divider(),

                  // Settings
                  _buildMenuItem(
                    icon: Icons.settings_outlined,
                    title: 'Settings',
                    onTap: () {
                      // TODO: Navigate to settings screen
                    },
                  ),
                  const Divider(),

                  // Support/FAQ
                  _buildMenuItem(
                    icon: Icons.help_outline,
                    title: 'Support/FAQ',
                    onTap: () {
                      // TODO: Navigate to support/FAQ screen
                    },
                  ),
                  const Divider(),

                  // Sign out
                  _buildMenuItem(
                    icon: Icons.logout,
                    title: 'Sign out',
                    textColor: Colors.red,
                    iconColor: Colors.red,
                    onTap: () async {
                      await accountService.logOut();
                      Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                              builder: (context) => LoginScreen()),
                          (Route) => false);
                      // TODO: Implement sign out logic
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.teal,
        onTap: (index) async {
          setState(() {
            _selectedIndex = index;
          });
          switch (index) {
            case 0:
              final SharedPreferences prefs =
                  await SharedPreferences.getInstance();
              final String? roleName = prefs.getString('roleName');
              if (roleName == "Courier") {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => DeliveryHomeScreen()),
                );
              } else if (roleName == "Florist") {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                      builder: (context) => StaffListOrderScreen()),
                );
              } else if (roleName == "StoreManager") {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                      builder: (context) => StoreOverviewScreen()),
                );
              } else {
                
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Invalid role")),
                );
              }
              break;

            case 1:
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => ProfileScreen()),
              );
              break;
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color textColor = Colors.black87,
    Color iconColor = Colors.black54,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: Row(
          children: [
            Icon(icon, size: 24, color: iconColor),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  color: textColor,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: iconColor,
            ),
          ],
        ),
      ),
    );
  }
}
