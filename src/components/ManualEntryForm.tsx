import React, { useState } from 'react';
import { User, Mail, BookOpen, Zap, AlertCircle } from 'lucide-react';
import { SUPPORTED_COURSES } from '../utils/constants';
import { ProcessedCandidate } from '../App';

interface ManualEntryFormProps {
  onGenerateCertificate: (candidate: ProcessedCandidate, course: string) => void;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onGenerateCertificate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.course) {
      newErrors.course = 'Please select a course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);

    try {
      // Create a ProcessedCandidate object
      const candidate: ProcessedCandidate = {
        id: `manual-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        courses: [formData.course],
        processedCourses: [],
        certificatesGenerated: 0,
        status: 'pending'
      };

      // Generate the certificate
      onGenerateCertificate(candidate, formData.course);

      // Reset form after successful generation
      setFormData({ name: '', email: '', course: '' });
      setErrors({});
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual Certificate Generation</h2>
        <p className="text-gray-600">Enter candidate details to generate an individual certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Candidate Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter candidate's full name"
          />
          {errors.name && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter candidate's email address"
          />
          {errors.email && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </div>
          )}
        </div>

        {/* Course Selection */}
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-2" />
            Course
          </label>
          <select
            id="course"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.course ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select a course</option>
            {SUPPORTED_COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          {errors.course && (
            <div className="mt-1 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.course}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Generating Certificate...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Generate Certificate</span>
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter the candidate's name exactly as it should appear on the certificate</li>
          <li>• Make sure the email address is valid for future communications</li>
          <li>• The certificate will be generated and ready for download immediately</li>
          <li>• You can preview the certificate before downloading</li>
        </ul>
      </div>
    </div>
  );
};