import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/esim_provider.dart';
import 'screens/home_shell_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: EsimGlobalApp(),
    ),
  );
}

class EsimGlobalApp extends ConsumerWidget {
  const EsimGlobalApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(isDarkModeProvider);

    return MaterialApp(
      title: 'eSIM Global',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      home: const HomeShellScreen(),
    );
  }
}
