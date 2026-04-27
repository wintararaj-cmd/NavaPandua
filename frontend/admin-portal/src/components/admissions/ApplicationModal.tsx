import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { classService, type Class } from '../../services/classService';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function ApplicationModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'family' | 'academic' | 'status'>('student');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialData || {
      status: 'SUBMITTED',
      gender: 'MALE',
      application_fee_paid: false,
      nationality: 'Indian',
      caste: 'GENERAL'
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      setActiveTab('student');
      if (initialData) {
        // Sanitize data: transform nested objects to IDs for form inputs
        const sanitizedData = { ...initialData };
        if (sanitizedData.target_class && typeof sanitizedData.target_class === 'object') {
          sanitizedData.target_class = sanitizedData.target_class.id;
        }
        if (sanitizedData.school && typeof sanitizedData.school === 'object') {
          sanitizedData.school = sanitizedData.school.id;
        }
        reset(sanitizedData);
      } else {
        reset({
          status: 'SUBMITTED',
          gender: 'MALE',
          application_fee_paid: false,
          nationality: 'Indian',
          caste: 'GENERAL'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const fetchClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data.results || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Clean data before sending to server
      const cleanData = { ...data };
      
      // Remove image fields if they are strings (URLs from backend)
      // Since we don't have file inputs in this modal yet, we shouldn't send back URLs or empty strings
      const imageFields = ['photo', 'father_photo', 'mother_photo'];
      imageFields.forEach(field => {
        if (typeof cleanData[field] === 'string') {
          delete cleanData[field];
        }
      });
      
      // Remove read-only or nested fields that might cause validation errors
      delete cleanData.class_details;
      delete cleanData.enquiry;
      
      // Ensure IDs are IDs, not objects
      if (cleanData.target_class && typeof cleanData.target_class === 'object') {
        cleanData.target_class = cleanData.target_class.id;
      }
      if (cleanData.school && typeof cleanData.school === 'object') {
        cleanData.school = cleanData.school.id;
      }
      
      // Handle empty numbers/decimals
      if (cleanData.father_income === "") {
        cleanData.father_income = null;
      }

      await onSave(cleanData);
      onClose();
    } catch (error: any) {
      console.error('Error saving application:', error);
      const serverResponse = error.response?.data;
      console.log('Server Response Body:', serverResponse);

      // Handle custom error structure: { success: false, error: { message: '...', details: { ... } } }
      const serverErrors = serverResponse?.error?.details || serverResponse;
      
      if (serverErrors && typeof serverErrors === 'object') {
        console.log('Extracted Server Error Details:', serverErrors);
        const firstErrorField = Object.keys(serverErrors)[0];
        const firstErrorMessage = Array.isArray(serverErrors[firstErrorField]) 
          ? serverErrors[firstErrorField][0] 
          : serverErrors[firstErrorField];
        
        // Handle non_field_errors
        const fieldDisplay = firstErrorField === 'non_field_errors' ? 'Error' : firstErrorField.replace(/_/g, ' ');
        toast.error(`Failed to save: ${fieldDisplay} - ${firstErrorMessage}`);
      } else {
        toast.error('Failed to save application. Please check all mandatory fields in all tabs.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50">
            <h3 className="text-lg font-bold text-indigo-900">
              {initialData ? 'Edit Application' : 'New Admission Application'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-2 space-x-4">
            {['student', 'family', 'academic', 'status'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-2 text-sm font-medium border-b-2 capitalize relative ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                  {/* Validation error indicator for tabs */}
                  {Object.keys(errors).some(key => {
                    const fieldTabMap: Record<string, string> = {
                      first_name: 'student', last_name: 'student', date_of_birth: 'student', gender: 'student',
                      father_name: 'family', father_phone: 'family', mother_name: 'family', mother_phone: 'family', address: 'family',
                      target_class: 'status'
                    };
                    return fieldTabMap[key] === tab;
                  }) && (
                    <span className="absolute -top-1 -right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
            
            <div className={activeTab === 'student' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!initialData && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Application Number *</label>
                    <input type="text" {...register('application_number', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input type="text" {...register('first_name', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input type="text" {...register('middle_name')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input type="text" {...register('last_name', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input type="date" {...register('date_of_birth', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender *</label>
                  <select {...register('gender')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <input type="text" {...register('blood_group')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Religion</label>
                  <select {...register('religion')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Christian">Christian</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caste</label>
                  <select {...register('caste')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="GENERAL">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <input type="text" {...register('nationality')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mother Tongue</label>
                  <select {...register('mother_tongue')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select Language</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Assamese">Assamese</option>
                    <option value="Odia">Odia</option>
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                  <input type="text" {...register('place_of_birth')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'family' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father Details */}
                <div className="md:col-span-2"><h4 className="font-semibold text-gray-900 border-b pb-2">Father's Details</h4></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Father's Name *</label>
                  <input type="text" {...register('father_name', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact No *</label>
                  <input type="text" {...register('father_phone', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email ID</label>
                  <input type="email" {...register('father_email')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualification</label>
                  <input type="text" {...register('father_qualification')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation Type</label>
                  <input type="text" {...register('father_occupation_type')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Govt, Pvt, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input type="text" {...register('father_occupation')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organisation Name</label>
                  <input type="text" {...register('father_organisation')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                  <input type="number" {...register('father_income')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>

                {/* Mother Details */}
                <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 border-b pb-2">Mother's Details</h4></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mother's Name *</label>
                  <input type="text" {...register('mother_name', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact No *</label>
                  <input type="text" {...register('mother_phone', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email ID</label>
                  <input type="email" {...register('mother_email')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualification</label>
                  <input type="text" {...register('mother_qualification')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                
                {/* Address Details */}
                <div className="md:col-span-2 mt-4"><h4 className="font-semibold text-gray-900 border-b pb-2">Residential Address</h4></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <textarea {...register('address', { required: 'Required' })} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" {...register('city')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select {...register('state')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select State</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Puducherry">Puducherry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input type="text" {...register('postal_code')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'academic' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous School Name</label>
                  <input type="text" {...register('previous_school_name')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous School Board</label>
                  <input type="text" {...register('previous_school_board')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous School Medium</label>
                  <input type="text" {...register('previous_school_medium')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Previous School Address</label>
                  <textarea {...register('previous_school_address')} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
              </div>
            </div>

            <div className={activeTab === 'status' ? '' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Class *</label>
                  <select {...register('target_class', { required: 'Required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Status *</label>
                  <select {...register('status')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="SELECTED">Selected</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ADMITTED">Admitted</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Changing status to "Admitted" will automatically create the student profile and user account.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 mt-4 p-4 border rounded-md bg-gray-50">
                    <input type="checkbox" {...register('application_fee_paid')} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm font-bold text-gray-700">Application / Admission Fee Paid</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 bg-gray-50 px-6 py-4 -mx-6 -mb-4 border-t">
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
                {loading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
