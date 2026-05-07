
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/dashboard_repository.dart';
import '../data/models/dashboard_stats.dart';

abstract class DashboardState {}

class DashboardInitial extends DashboardState {}
class DashboardLoading extends DashboardState {}
class DashboardLoaded extends DashboardState {
  final DashboardStats stats;
  DashboardLoaded(this.stats);
}
class DashboardError extends DashboardState {
  final String message;
  DashboardError(this.message);
}

class DashboardCubit extends Cubit<DashboardState> {
  final DashboardRepository _repository;

  DashboardCubit(this._repository) : super(DashboardInitial());

  Future<void> fetchStats() async {
    emit(DashboardLoading());
    try {
      final stats = await _repository.getDashboardStats();
      emit(DashboardLoaded(stats));
    } catch (e) {
      emit(DashboardError(e.toString()));
    }
  }
}
