
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../features/auth/data/auth_repository.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/dashboard/presentation/teacher_dashboard_screen.dart';
import '../features/dashboard/cubit/dashboard_cubit.dart';
import '../features/dashboard/data/dashboard_repository.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthRepository>().getUser();
    
    if (user?.role == 'TEACHER' || user?.role == 'SCHOOL_ADMIN' || user?.role == 'SUPER_ADMIN') {
      return const TeacherDashboardScreen();
    }
    
    // Default to Student Dashboard
    return BlocProvider(
      create: (context) => DashboardCubit(
        RepositoryProvider.of<DashboardRepository>(context),
      ),
      child: const DashboardScreen(),
    );
  }
}
