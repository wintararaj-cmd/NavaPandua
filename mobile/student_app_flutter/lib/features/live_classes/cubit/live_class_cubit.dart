
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/live_class_repository.dart';
import '../data/models/live_class.dart';

abstract class LiveClassState {}

class LiveClassInitial extends LiveClassState {}
class LiveClassLoading extends LiveClassState {}
class LiveClassLoaded extends LiveClassState {
  final List<LiveClass> liveClasses;
  LiveClassLoaded(this.liveClasses);
}
class LiveClassError extends LiveClassState {
  final String message;
  LiveClassError(this.message);
}

class LiveClassCubit extends Cubit<LiveClassState> {
  final LiveClassRepository _repository;

  LiveClassCubit(this._repository) : super(LiveClassInitial());

  Future<void> fetchLiveClasses() async {
    emit(LiveClassLoading());
    try {
      final liveClasses = await _repository.getLiveClasses();
      emit(LiveClassLoaded(liveClasses));
    } catch (e) {
      emit(LiveClassError(e.toString()));
    }
  }
}
