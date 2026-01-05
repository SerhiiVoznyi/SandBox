import 'package:flutter/material.dart';

import '../features/splash/splash_screen.dart';
import '../features/profile/local_profile_screen.dart';
import '../features/games/games_list_screen.dart';
import '../features/yum_or_yuck/game_screen.dart';

class AppRoutes {
  static const splash = '/';
  static const profile = '/profile';
  static const games = '/games';
  static const yumOrYuck = '/yum-or-yuck';

  static Map<String, WidgetBuilder> routes = {
    splash: (_) => const SplashScreen(),
    profile: (_) => const LocalProfileScreen(),
    games: (_) => const GamesListScreen(),
    yumOrYuck: (_) => const YumOrYuckGameScreen(),
  };
}
