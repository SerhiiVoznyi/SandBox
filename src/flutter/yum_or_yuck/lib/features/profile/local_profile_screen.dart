import 'package:flutter/material.dart';
import '../../app/routes.dart';

class LocalProfileScreen extends StatelessWidget {
  const LocalProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pushReplacementNamed(context, AppRoutes.games);
          },
          child: const Text('Create profile'),
        ),
      ),
    );
  }
}
