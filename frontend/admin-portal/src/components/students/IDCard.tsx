import React from 'react';
import { type Student } from '../../services/studentService';
import { type School } from '../../services/schoolService';

interface Props {
  student: Student;
  school: School;
}

export default function IDCard({ student, school }: Props) {
  const getFullName = () => {
    return `${student.first_name || ''} ${student.last_name || ''}`.trim();
  };


  return (
    <div className="id-card-container p-4 flex justify-center">
      <div 
        id={`id-card-${student.id}`}
        className="w-[320px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative font-sans"
        style={{
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        {/* Top Header Background */}
        <div className="h-24 bg-indigo-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-400 rounded-full -ml-8 -mb-8 opacity-30"></div>
        </div>

        {/* School Info */}
        <div className="absolute top-4 left-0 right-0 text-center px-4">
          <div className="flex justify-center mb-1">
            {school.logo ? (
              <img src={school.logo} alt="Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1" />
            ) : (
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                {school.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-white font-bold text-sm uppercase tracking-wider truncate">{school.name}</h2>
          <p className="text-indigo-100 text-[10px] truncate">{school.address_line1}, {school.city}</p>
        </div>

        {/* Photo Section */}
        <div className="mt-[-40px] flex justify-center relative z-10">
          <div className="w-32 h-32 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-gray-100">
            {student.photo ? (
              <img src={student.photo} alt={getFullName()} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Student Details */}
        <div className="px-6 py-4 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{getFullName()}</h1>
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase mb-4">
            Student
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-left border-t border-indigo-200 pt-4">
            <div>
              <p className="text-[10px] text-indigo-500 uppercase font-bold">Admission No</p>
              <p className="text-sm font-bold text-gray-700">{student.admission_number}</p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-500 uppercase font-bold">Class / Sec</p>
              <p className="text-sm font-bold text-gray-700">
                {student.class_details?.name || 'N/A'} - {student.section_details?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-500 uppercase font-bold">Roll No</p>
              <p className="text-sm font-bold text-gray-700">{student.roll_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-500 uppercase font-bold">Blood Group</p>
              <p className="text-sm font-bold text-gray-700">{student.blood_group || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-indigo-500 uppercase font-bold">D.O.B</p>
              <p className="text-sm font-bold text-gray-700">
                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] text-indigo-500 uppercase font-bold">Phone</p>
              <p className="text-sm font-bold text-gray-700">{student.father_phone || student.user?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-indigo-700 flex items-center justify-center">
          <p className="text-white text-[10px] font-medium tracking-widest uppercase">Academic Year 2026-27</p>
        </div>

        {/* Signature Placeholder */}
        <div className="absolute bottom-12 right-6 text-center">
          <div className="w-20 border-b border-gray-400 mb-1"></div>
          <p className="text-[8px] text-gray-500 font-bold uppercase">Principal</p>
        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .id-card-container, .id-card-container * {
            visibility: visible;
          }
          .id-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white !important;
            padding: 0;
            margin: 0;
          }
          #id-card-${student.id} {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
