
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../cubit/dashboard_cubit.dart';
import '../../../core/constants/app_colors.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    context.read<DashboardCubit>().fetchStats();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: BlocBuilder<DashboardCubit, DashboardState>(
        builder: (context, state) {
          if (state is DashboardLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is DashboardError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
                  const SizedBox(height: 16),
                  Text(state.message),
                  ElevatedButton(
                    onPressed: () => context.read<DashboardCubit>().fetchStats(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (state is DashboardLoaded) {
            final stats = state.stats;
            return RefreshIndicator(
              onRefresh: () => context.read<DashboardCubit>().fetchStats(),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome Back!',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Here is what\'s happening today',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Stats Grid
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.5,
                      children: [
                        _StatCard(
                          label: 'Students',
                          value: stats.totalStudents.toString(),
                          icon: FontAwesomeIcons.userGraduate,
                          color: Colors.blue,
                        ),
                        _StatCard(
                          label: 'Teachers',
                          value: stats.totalTeachers.toString(),
                          icon: FontAwesomeIcons.chalkboardTeacher,
                          color: Colors.green,
                        ),
                        _StatCard(
                          label: 'Schools',
                          value: stats.totalSchools.toString(),
                          icon: FontAwesomeIcons.school,
                          color: Colors.purple,
                        ),
                        _StatCard(
                          label: 'Organizations',
                          value: stats.totalOrganizations.toString(),
                          icon: FontAwesomeIcons.building,
                          color: Colors.orange,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Attendance Section
                    _SectionHeader(title: 'Today\'s Attendance', onSeeAll: () {}),
                    const SizedBox(height: 12),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Row(
                          children: [
                            SizedBox(
                              height: 100,
                              width: 100,
                              child: Stack(
                                children: [
                                  Center(
                                    child: CircularProgressIndicator(
                                      value: stats.attendanceToday.percentage / 100,
                                      strokeWidth: 10,
                                      backgroundColor: AppColors.gray100,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  Center(
                                    child: Text(
                                      '${stats.attendanceToday.percentage.toInt()}%',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 24),
                            Expanded(
                              child: Column(
                                children: [
                                  _AttendanceMiniStat(
                                    label: 'Present',
                                    value: stats.attendanceToday.present.toString(),
                                    color: Colors.green,
                                  ),
                                  const Divider(height: 16),
                                  _AttendanceMiniStat(
                                    label: 'Absent',
                                    value: stats.attendanceToday.absent.toString(),
                                    color: Colors.red,
                                  ),
                                  const Divider(height: 16),
                                  _AttendanceMiniStat(
                                    label: 'Late',
                                    value: stats.attendanceToday.late.toString(),
                                    color: Colors.orange,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Finance Section
                    _SectionHeader(title: 'Finance Overview', onSeeAll: () {}),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, Color(0xFF6366F1)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Monthly Collection',
                                style: TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${stats.finance.currency} ${stats.finance.monthlyCollection.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const CircleAvatar(
                            backgroundColor: Colors.white24,
                            child: Icon(Icons.account_balance_wallet, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Quick Actions
                    const Text(
                      'Quick Actions',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      alignment: WrapAlignment.start,
                      children: [
                        _QuickAction(
                          icon: Icons.assignment_turned_in,
                          label: 'Homework',
                          onTap: () => Navigator.pushNamed(context, '/assignments'),
                        ),
                        _QuickAction(icon: Icons.person_add, label: 'Admissions', onTap: () {}),
                        _QuickAction(
                          icon: Icons.event_note,
                          label: 'Attendance',
                          onTap: () => Navigator.pushNamed(context, '/attendance'),
                        ),
                        _QuickAction(
                          icon: Icons.payments,
                          label: 'Fees',
                          onTap: () => Navigator.pushNamed(context, '/fees'),
                        ),
                        _QuickAction(
                          icon: Icons.assignment,
                          label: 'Exams',
                          onTap: () => Navigator.pushNamed(context, '/exams'),
                        ),
                        _QuickAction(
                          icon: Icons.live_tv,
                          label: 'Live',
                          onTap: () => Navigator.pushNamed(context, '/live-classes'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: FaIcon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              Text(
                label,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback onSeeAll;

  const _SectionHeader({required this.title, required this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        TextButton(
          onPressed: onSeeAll,
          child: const Text('See All'),
        ),
      ],
    );
  }
}

class _AttendanceMiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _AttendanceMiniStat({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          ],
        ),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.gray100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.medium),
        ),
      ],
    );
  }
}
