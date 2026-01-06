import 'package:flutter/material.dart';
import '../../app/routes.dart';
import '../../shared/app_constants.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: AppConstants.waitTimeSeconds), () {
      Navigator.pushReplacementNamed(context, AppRoutes.profile);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/images/logo/app_logo.png',
              scale: AppConstants.imageScale,
            ),
            const SizedBox(height: 16),
            Text('YUM GAMES', style: Theme.of(context).textTheme.headlineLarge),
          ],
        ),
      ),
    );
  }
}
