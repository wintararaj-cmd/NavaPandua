
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/dashboard/cubit/dashboard_cubit.dart';
import '../../features/dashboard/data/dashboard_repository.dart';
import '../../features/attendance/presentation/attendance_screen.dart';
import '../../features/attendance/cubit/attendance_cubit.dart';
import '../../features/attendance/data/attendance_repository.dart';
import '../../features/fees/presentation/fee_screen.dart';
import '../../features/fees/cubit/fee_cubit.dart';
import '../../features/fees/data/fee_repository.dart';
import '../../features/exams/presentation/exam_screen.dart';
import '../../features/exams/cubit/exam_cubit.dart';
import '../../features/exams/data/exam_repository.dart';
import '../../features/live_classes/presentation/live_class_screen.dart';
import '../../features/live_classes/cubit/live_class_cubit.dart';
import '../../features/live_classes/data/live_class_repository.dart';
import '../../features/assignments/presentation/assignment_screen.dart';
import '../../features/assignments/cubit/assignment_cubit.dart';
import '../../features/assignments/data/assignment_repository.dart';
import '../presentation/home_screen.dart';
import '../network/api_client.dart';

class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => LoginCubit(
              RepositoryProvider.of<AuthRepository>(context),
            ),
            child: const LoginScreen(),
          ),
        );
      case '/dashboard':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/attendance':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => AttendanceCubit(
              RepositoryProvider.of<AttendanceRepository>(context),
            ),
            child: const AttendanceScreen(),
          ),
        );
      case '/fees':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => FeeCubit(
              RepositoryProvider.of<FeeRepository>(context),
            ),
            child: const FeeScreen(),
          ),
        );
      case '/exams':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => ExamCubit(
              RepositoryProvider.of<ExamRepository>(context),
            ),
            child: const ExamScreen(),
          ),
        );
      case '/live-classes':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => LiveClassCubit(
              RepositoryProvider.of<LiveClassRepository>(context),
            ),
            child: const LiveClassScreen(),
          ),
        );
      case '/assignments':
        return MaterialPageRoute(
          builder: (context) => BlocProvider(
            create: (context) => AssignmentCubit(
              RepositoryProvider.of<AssignmentRepository>(context),
            ),
            child: const AssignmentScreen(),
          ),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
