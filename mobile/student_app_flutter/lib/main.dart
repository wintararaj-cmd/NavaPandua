import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/constants/app_theme.dart';
import 'core/navigation/app_router.dart';
import 'core/network/api_client.dart';
import 'features/auth/cubit/login_cubit.dart';
import 'features/auth/data/auth_remote_data_source.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/dashboard/data/dashboard_repository.dart';
import 'features/attendance/data/attendance_repository.dart';
import 'features/fees/data/fee_repository.dart';
import 'features/exams/data/exam_repository.dart';
import 'features/live_classes/data/live_class_repository.dart';
import 'features/assignments/data/assignment_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  final apiClient = ApiClient();
  
  // Repositories
  final authRemoteDataSource = AuthRemoteDataSource(apiClient);
  final authRepository = AuthRepository(authRemoteDataSource, prefs);
  final dashboardRepository = DashboardRepository(apiClient);
  final attendanceRepository = AttendanceRepository(apiClient);
  final feeRepository = FeeRepository(apiClient);
  final examRepository = ExamRepository(apiClient);
  final liveClassRepository = LiveClassRepository(apiClient);
  final assignmentRepository = AssignmentRepository(apiClient);

  runApp(MyApp(
    authRepository: authRepository,
    dashboardRepository: dashboardRepository,
    attendanceRepository: attendanceRepository,
    feeRepository: feeRepository,
    examRepository: examRepository,
    liveClassRepository: liveClassRepository,
    assignmentRepository: assignmentRepository,
  ));
}

class MyApp extends StatelessWidget {
  final AuthRepository authRepository;
  final DashboardRepository dashboardRepository;
  final AttendanceRepository attendanceRepository;
  final FeeRepository feeRepository;
  final ExamRepository examRepository;
  final LiveClassRepository liveClassRepository;
  final AssignmentRepository assignmentRepository;

  const MyApp({
    super.key,
    required this.authRepository,
    required this.dashboardRepository,
    required this.attendanceRepository,
    required this.feeRepository,
    required this.examRepository,
    required this.liveClassRepository,
    required this.assignmentRepository,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: authRepository),
        RepositoryProvider.value(value: dashboardRepository),
        RepositoryProvider.value(value: attendanceRepository),
        RepositoryProvider.value(value: feeRepository),
        RepositoryProvider.value(value: examRepository),
        RepositoryProvider.value(value: liveClassRepository),
        RepositoryProvider.value(value: assignmentRepository),
      ],
      child: MaterialApp(
        title: 'Student App',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        onGenerateRoute: AppRouter.onGenerateRoute,
        // Optional: Check if logged in and redirect to dashboard
        // home: prefs.getString('access_token') != null ? ... : const LoginScreen(),
      ),
    );
  }
}
