import 'package:flowerops/model/employee.dart';
import 'package:flowerops/services/account_service.dart';
import 'package:flowerops/services/employee_service.dart';
import 'package:flutter/material.dart';

class PersonalInformationScreen extends StatefulWidget {
  const PersonalInformationScreen({super.key});

  @override
  State<PersonalInformationScreen> createState() =>
      _PersonalInformationScreenState();
}

class _PersonalInformationScreenState extends State<PersonalInformationScreen> {
  Employee? employee;
  bool isLoading = true;
  bool isUpdating = false;
  bool isResettingPassword = false;

  // Controllers for update form
  final TextEditingController fullNameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();

  // Controllers for password reset form
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();

  // Form keys
  final _updateFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final EmployeeService _employeeService = EmployeeService();

  @override
  void initState() {
    super.initState();
    _loadEmployeeData();
  }

  @override
  void dispose() {
    fullNameController.dispose();
    phoneController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadEmployeeData() async {
    setState(() {
      isLoading = true;
    });

    final employeeData = await _employeeService.getEmployeeById();

    setState(() {
      employee = employeeData;
      isLoading = false;

      // Initialize controllers with current values
      if (employee != null) {
        fullNameController.text = employee!.fullName;
        phoneController.text = employee!.phone;
      }
    });
  }

  void _showUpdateForm() {
    setState(() {
      isUpdating = true;
      isResettingPassword = false;
    });
  }

  void _showPasswordResetForm() {
    setState(() {
      isResettingPassword = true;
      isUpdating = false;

      // Clear password controllers
      newPasswordController.clear();
      confirmPasswordController.clear();
    });
  }

  void _cancelForms() {
    setState(() {
      isUpdating = false;
      isResettingPassword = false;
    });
  }

  Future<void> _updateEmployeeInfo() async {
    if (!_updateFormKey.currentState!.validate()) return;

    setState(() {
      isLoading = true;
    });

    final updatedEmployee = await _employeeService.updateEmployeeInfo(
      fullName: fullNameController.text,
      phone: phoneController.text,
    );

    setState(() {
      employee = updatedEmployee;
      isLoading = false;
      isUpdating = false;
    });

    if (updatedEmployee != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Information updated successfully')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update information')),
      );
    }
  }

  Future<void> _resetPassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;

    setState(() {
      isLoading = true;
    });

    final success =
        await _employeeService.resetPassword(newPasswordController.text);

    setState(() {
      isLoading = false;
      isResettingPassword = false;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to reset password')),
      );
    }
  }

  void _showFullSizeImage(String? imageUrl, String title) {
    if (imageUrl == null) return;

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: Center(
            child: InteractiveViewer(
              boundaryMargin: const EdgeInsets.all(20),
              minScale: 0.5,
              maxScale: 4.0,
              child: Image.network(
                imageUrl,
                fit: BoxFit.contain,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Center(child: CircularProgressIndicator());
                },
                errorBuilder: (context, error, stackTrace) {
                  return const Center(
                    child: Text('Could not load image'),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarSection() {
    return Center(
      child: Column(
        children: [
          GestureDetector(
            onTap: () {
              if (employee?.avatar != null) {
                _showFullSizeImage(employee!.avatar, 'Profile Picture');
              }
            },
            child: CircleAvatar(
              radius: 60,
              backgroundImage: employee?.avatar != null
                  ? NetworkImage(employee!.avatar!)
                  : null,
              child: employee?.avatar == null
                  ? const Icon(Icons.person, size: 60)
                  : null,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            employee?.fullName ?? 'Loading...',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            employee?.roleName ?? '',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmployeeInfo() {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Personal Information',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Divider(),
            _buildInfoItem('Email', employee?.email ?? ''),
            _buildInfoItem('Phone', employee?.phone ?? ''),
            _buildInfoItem('Address', employee?.address ?? ''),
            _buildInfoItem(
                'Gender', employee?.gender == true ? 'Male' : 'Female'),
            _buildInfoItem(
                'Birthday',
                employee?.birthday != null
                    ? '${employee!.birthday.day}/${employee!.birthday.month}/${employee!.birthday.year}'
                    : ''),
            _buildInfoItem('ID Number', employee?.identificationNumber ?? ''),

            // ID Photos section
            if (employee?.identificationFontOfPhoto != null ||
                employee?.identificationBackOfPhoto != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  const Text(
                    'Identification Documents',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      if (employee?.identificationFontOfPhoto != null)
                        GestureDetector(
                          onTap: () => _showFullSizeImage(
                              employee!.identificationFontOfPhoto, 'Front ID'),
                          child: Column(
                            children: [
                              Container(
                                width: 120,
                                height: 80,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(8),
                                  image: DecorationImage(
                                    image: NetworkImage(
                                        employee!.identificationFontOfPhoto!),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text('Front ID'),
                            ],
                          ),
                        ),
                      if (employee?.identificationBackOfPhoto != null)
                        GestureDetector(
                          onTap: () => _showFullSizeImage(
                              employee!.identificationBackOfPhoto, 'Back ID'),
                          child: Column(
                            children: [
                              Container(
                                width: 120,
                                height: 80,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey),
                                  borderRadius: BorderRadius.circular(8),
                                  image: DecorationImage(
                                    image: NetworkImage(
                                        employee!.identificationBackOfPhoto!),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text('Back ID'),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),

            const SizedBox(height: 20),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _showUpdateForm,
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text('Update Info',
                          style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 8),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton.icon(
                      onPressed: _showPasswordResetForm,
                      icon: const Icon(Icons.lock, size: 16),
                      label: const Text('Reset Pass',
                          style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUpdateForm() {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _updateFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Update Information',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Divider(),
              TextFormField(
                controller: fullNameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  icon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  icon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: _cancelForms,
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: _updateEmployeeInfo,
                    child: const Text('Save Changes'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordResetForm() {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _passwordFormKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Reset Password',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Divider(),
              TextFormField(
                controller: newPasswordController,
                decoration: const InputDecoration(
                  labelText: 'New Password',
                  icon: Icon(Icons.lock_outline),
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a new password';
                  }
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: confirmPasswordController,
                decoration: const InputDecoration(
                  labelText: 'Confirm Password',
                  icon: Icon(Icons.lock),
                  errorMaxLines: 2,
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != newPasswordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: _cancelForms,
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: _resetPassword,
                    child: const Text('Reset Password'),
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal Information'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : employee == null
              ? const Center(
                  child: Text('Failed to load employee information'),
                )
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      _buildAvatarSection(),
                      const SizedBox(height: 16),
                      if (!isUpdating && !isResettingPassword)
                        _buildEmployeeInfo(),
                      if (isUpdating) _buildUpdateForm(),
                      if (isResettingPassword) _buildPasswordResetForm(),
                    ],
                  ),
                ),
    );
  }
}
