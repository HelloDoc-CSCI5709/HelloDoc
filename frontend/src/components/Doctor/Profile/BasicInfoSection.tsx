import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from './ProfileImageUpload';
import { InputField, TextAreaField, SelectField, MultiSelectField } from './ProfileFormFields';
import { ALLOWED_SPECIALIZATIONS } from './types';
import type { Doctor } from '../../../redux/types/doctorTypes';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { updateBasicDoctorProfile, getDoctorProfile } from '../../../redux/actions/doctorActions';

interface BasicInfoSectionProps {
  doctorId?: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ doctorId }) => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, success } = useAppSelector(state => state.doctor);
  
  const [formData, setFormData] = useState<Partial<Doctor>>({
    fullName: '',
    email: '',
    dob: '',
    gender: '',
    phone: '',
    education: '',
    specialization: [],
    bio: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctorId) {
      dispatch(getDoctorProfile(doctorId));
    } else {
      dispatch(getDoctorProfile(null));
    }
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.user?.fullName || '',
        email: profile.user?.email || '',
        dob: profile.doctor?.dob ? new Date(profile.doctor.dob).toISOString().split('T')[0] : '',
        gender: profile.doctor?.gender || '',
        phone: profile.doctor?.phone || '',
        education: profile.doctor?.education || '',
        specialization: profile.doctor?.specialization || [],
        bio: profile.doctor?.bio || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (success && !loading && isSubmitting) {
      toast.success('Profile updated successfully!');
      setIsSubmitting(false);
    }
  }, [success, loading, isSubmitting]);

  useEffect(() => {
    if (error && !loading && isSubmitting) {
      toast.error(`Error: ${error}`);
      setIsSubmitting(false);
    }
  }, [error, loading, isSubmitting]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email format is invalid';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = 'Phone number format is invalid';
    }

    if (!formData.specialization || formData.specialization.length === 0) {
      errors.specialization = 'At least one specialization is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSpecializationChange = (values: string[]) => {
    setFormData(prev => ({
      ...prev,
      specialization: values
    }));

    if (formErrors.specialization) {
      setFormErrors(prev => ({
        ...prev,
        specialization: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateBasicDoctorProfile(formData)).unwrap();
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.user?.fullName || '',
        email: profile.user?.email || '',
        dob: profile.doctor?.dob ? new Date(profile.doctor.dob).toISOString().split('T')[0] : '',
        gender: profile.doctor?.gender || '',
        phone: profile.doctor?.phone || '',
        education: profile.doctor?.education || '',
        specialization: profile.doctor?.specialization || [],
        bio: profile.doctor?.bio || ''
      });
    }
    setFormErrors({});
    toast.info('Changes canceled');
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
        <p className="text-gray-600">Update your professional profile information</p>
      </div>

      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
        <ProfileImageUpload
          currentImage={profile?.doctor?.profilePicture?.path}
          onUploadSuccess={() => {
            toast.success('Profile picture updated successfully!');
            dispatch(getDoctorProfile(null));
          }}
          disabled={loading || isSubmitting}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            error={formErrors.fullName}
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            error={formErrors.email}
          />

          <InputField
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            error={formErrors.dob}
          />

          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
            error={formErrors.gender}
          />

          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            error={formErrors.phone}
          />

          <InputField
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            placeholder="Medical School, Residency, etc."
            error={formErrors.education}
          />
        </div>

        <MultiSelectField
          label="Specializations"
          name="specialization"
          value={formData.specialization}
          onChange={handleSpecializationChange}
          options={ALLOWED_SPECIALIZATIONS}
          error={formErrors.specialization}
        />

        <TextAreaField
          label="Professional Bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell patients about your experience, approach, and specialties..."
          rows={4}
          error={formErrors.bio}
        />

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoSection;
