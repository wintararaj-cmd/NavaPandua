import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { timetableService } from '../../services/academicServices';
import { classService, type Class, type Section } from '../../services/classService';
import { subjectService, type Subject } from '../../services/subjectService';
import { teacherService, type Teacher } from '../../services/teacherService';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function TimetableModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      day_of_week: 0,
    }
  });

  const selectedClass = watch('target_class');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (initialData) {
        reset(initialData);
      }
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const [classesData, subjectsData, teachersData, periodsData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        teacherService.getTeachers(),
        timetableService.getPeriods()
      ]);
      setClasses(classesData.results || []);
      setSubjects(subjectsData.results || []);
      setTeachers(teachersData.results || []);
      setPeriods(periodsData.results || periodsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchSections = async (classId: string) => {
    try {
      const data = await classService.getSections(classId);
      setSections(data.results || data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving timetable entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50">
            <h3 className="text-lg font-bold text-indigo-900">
              {initialData ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                  {...register('target_class', { required: 'Required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                {errors.target_class && <p className="mt-1 text-xs text-red-500">{errors.target_class.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  {...register('section', { required: 'Required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
                {errors.section && <p className="mt-1 text-xs text-red-500">{errors.section.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Day</label>
                <select
                  {...register('day_of_week', { required: 'Required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <select
                  {...register('period', { required: 'Required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Period</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.start_time} - {p.end_time})</option>
                  ))}
                </select>
                {errors.period && <p className="mt-1 text-xs text-red-500">{errors.period.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  {...register('subject')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Free Period</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <select
                  {...register('teacher')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user_name || t.id}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  {...register('room_number')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 bg-gray-50 px-6 py-4 -mx-6 -mb-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
