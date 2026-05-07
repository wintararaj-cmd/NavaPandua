
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/data/auth_repository.dart';

class TeacherDashboardScreen extends StatelessWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthRepository>().getUser();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Portal', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthRepository>().logout();
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, Prof. ${user?.lastName ?? 'Teacher'}',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.text,
                  ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Manage your classes and assignments',
              style: TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 24),
            
            // Teacher Stats
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _TeacherStatCard(
                  label: 'My Classes',
                  value: '4',
                  icon: Icons.class_outlined,
                  color: Colors.blue,
                ),
                _TeacherStatCard(
                  label: 'Active Exams',
                  value: '1',
                  icon: Icons.assignment_outlined,
                  color: Colors.orange,
                ),
                _TeacherStatCard(
                  label: 'Pending Grades',
                  value: '12',
                  icon: Icons.star_outline,
                  color: Colors.red,
                ),
                _TeacherStatCard(
                  label: 'Live Sessions',
                  value: '2',
                  icon: Icons.videocam_outlined,
                  color: Colors.green,
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            const Text(
              'Quick Actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            _ActionTile(
              title: 'Assignments',
              subtitle: 'Create, view and grade assignments',
              icon: Icons.assignment_turned_in,
              color: AppColors.primary,
              onTap: () => Navigator.pushNamed(context, '/assignments'),
            ),
            const SizedBox(height: 12),
            _ActionTile(
              title: 'Mark Attendance',
              subtitle: 'Daily attendance for your sections',
              icon: Icons.how_to_reg,
              color: Colors.emerald,
              onTap: () {},
            ),
            const SizedBox(height: 12),
            _ActionTile(
              title: 'Live Class',
              subtitle: 'Start a new virtual classroom session',
              icon: Icons.add_to_queue,
              color: Colors.purple,
              onTap: () {},
            ),
            const SizedBox(height: 12),
            _ActionTile(
              title: 'Exams & Grading',
              subtitle: 'Upload marks and generate report cards',
              icon: Icons.grade,
              color: Colors.orange,
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _TeacherStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _TeacherStatCard({
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
          Text(
            label,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(subtitle, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.gray300),
          ],
        ),
      ),
    );
  }
}
