
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/attendance_repository.dart';
import '../data/models/attendance.dart';

abstract class AttendanceState {}

class AttendanceInitial extends AttendanceState {}
class AttendanceLoading extends AttendanceState {}
class AttendanceLoaded extends AttendanceState {
  final AttendanceSummary summary;
  final List<AttendanceRecord> history;
  AttendanceLoaded(this.summary, this.history);
}
class AttendanceError extends AttendanceState {
  final String message;
  AttendanceError(this.message);
}

class AttendanceCubit extends Cubit<AttendanceState> {
  final AttendanceRepository _repository;

  AttendanceCubit(this._repository) : super(AttendanceInitial());

  Future<void> fetchAttendance() async {
    emit(AttendanceLoading());
    try {
      final summary = await _repository.getAttendanceSummary();
      final history = await _repository.getAttendanceHistory();
      emit(AttendanceLoaded(summary, history));
    } catch (e) {
      emit(AttendanceError(e.toString()));
    }
  }
}
