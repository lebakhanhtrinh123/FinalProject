import 'package:flowerops/screen/delivery_home_screen.dart';
import 'package:flowerops/screen/forgot_pass_word_flow_screen.dart';
import 'package:flowerops/screen/manager_list_order_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/screen/sign_up_delivery_screen.dart';
import 'package:flowerops/screen/sign_up_screen.dart';
import 'package:flowerops/screen/staff_list_order_screen.dart';
import 'package:flowerops/screen/store_overview_screen.dart';
import 'package:flowerops/services/account_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

Future<void> login(BuildContext context, String email, String password) async {
  final AccountService accountService = AccountService();

  if (await accountService.login(email, password)) {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString("saved_email", email);

    final String? roleName = prefs.getString('roleName');
    if (roleName == "StoreManager") {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => StoreOverviewScreen()),
      );
    } else if (roleName == "Florist") {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => StaffListOrderScreen()),
      );
    }else if (roleName == "Courier") {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => DeliveryHomeScreen()),
      );
    }
    
     else {
      _showLoginError(context, 'Unauthorized role');
    }
  } else {
    _showLoginError(context, 'Login failed');
  }
}

void _showLoginError(BuildContext context, String message) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text('Error'),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Đóng thông báo
            },
            child: Text('OK'),
          ),
        ],
      );
    },
  );
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isPasswordVisible = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSavedEmail(); 
  }

  Future<void> _loadSavedEmail() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    String? savedEmail = prefs.getString('saved_email');
    if (savedEmail != null) {
      setState(() {
        _emailController.text = savedEmail; 
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // Thêm background màu trắng
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 60),
              Text(
                'Welcome',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Please input your details',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 48),

              // Email TextField 
              Container(
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 211, 222, 230),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: const Color.fromARGB(255, 255, 255, 255)!),
                ),
                child: TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 16,
                  ),
                  decoration: InputDecoration(
                    hintText: 'youremails@.com',
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 16,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    isDense: true,
                  ),
                ),
              ),
              SizedBox(height: 16),

              // Password TextField với style mới
              Container(
                decoration: BoxDecoration(
                  color: const Color.fromARGB(255, 211, 222, 230),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: const Color.fromARGB(255, 255, 255, 255)!),
                ),
                child: TextField(
                  controller: _passController,
                  obscureText: !_isPasswordVisible,
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 16,
                  ),
                  decoration: InputDecoration(
                    hintText: '••••••••••••', // Hiển thị các chấm chấm
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 16,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                    isDense: true,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: Colors.grey[600],
                      ),
                      onPressed: () {
                        setState(() {
                          _isPasswordVisible = !_isPasswordVisible;
                        });
                      },
                    ),
                  ),
                ),
              ),

              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ForgotPassWordFlowScreen(),
                      ),
                    );
                  },
                  child: Text(
                    'Forgot Password?',
                    style: TextStyle(
                      color: const Color.fromARGB(221, 1, 77, 255),
                    ),
                  ),
                ),
              ),

              SizedBox(height: 24),

              // Login Button với style mới
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    login(context, _emailController.text, _passController.text);
                    // Điều hướng sang DeliveryHomeScreen
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //     builder: (context) => MainNavigationWidget(),
                    //   ),
                    // );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF006D77),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0, // Bỏ shadow
                  ),
                  child: Text(
                    'Login',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),

              SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Need an account? ',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text('Select Account Type'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const SignUpScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xFF006D77),
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    minimumSize: Size(double.infinity, 0),
                                  ),
                                  child: Text(
                                    'Staff Registration',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                ),
                                SizedBox(height: 12),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.pop(context);
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            const SignUpDeliveryScreen(),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xFF006D77),
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    minimumSize: Size(double.infinity, 0),
                                  ),
                                  child: Text(
                                    'Delivery Registration',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                    child: Text(
                      'Sign up',
                      style: TextStyle(
                        color: Color(0xFF006D77),
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passController.dispose();
    super.dispose();
  }
}
