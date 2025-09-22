import React, { useState } from 'react';
import { Play, Download, Eye, Mail, Users, BookOpen, CheckCircle } from 'lucide-react';
import { ProcessedCandidate } from '../App';
import { generateCertificatePDF } from '../utils/certificateGenerator';
import { exportBatchData } from '../utils/dataExporter';

interface DashboardProps {
  candidates: ProcessedCandidate[];
  setCandidates: React.Dispatch<React.SetStateAction<ProcessedCandidate[]>>;
  onPreviewCertificate: (candidate: ProcessedCandidate, course: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  candidates, 
  setCandidates, 
  onPreviewCertificate 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentCandidate, setCurrentCandidate] = useState('');

  const totalCertificates = candidates.reduce((sum, candidate) => 
    sum + candidate.courses.length, 0
  );

  const completedCertificates = candidates.reduce((sum, candidate) => 
    sum + candidate.certificatesGenerated, 0
  );

  const processBatch = async () => {
    setIsProcessing(true);
    setProcessedCount(0);

    for (const candidate of candidates) {
      setCurrentCandidate(candidate.name);
      
      setCandidates(prev => 
        prev.map(c => 
          c.id === candidate.id 
            ? { ...c, status: 'processing' as const }
            : c
        )
      );

      try {
        for (const course of candidate.courses) {
          if (!candidate.processedCourses.includes(course)) {
            await generateCertificatePDF(candidate, course);
            
            setCandidates(prev =>
              prev.map(c =>
                c.id === candidate.id
                  ? {
                      ...c,
                      processedCourses: [...c.processedCourses, course],
                      certificatesGenerated: c.certificatesGenerated + 1
                    }
                  : c
              )
            );
            
            setProcessedCount(prev => prev + 1);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }

        setCandidates(prev =>
          prev.map(c =>
            c.id === candidate.id
              ? { ...c, status: 'completed' as const }
              : c
          )
        );
      } catch (error) {
        setCandidates(prev =>
          prev.map(c =>
            c.id === candidate.id
              ? { ...c, status: 'error' as const }
              : c
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentCandidate('');
  };

  const handleExportData = () => {
    const completedCandidates = candidates.filter(c => c.status === 'completed');
    exportBatchData(completedCandidates);
  };

  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Generated</p>
              <p className="text-2xl font-bold text-gray-900">{completedCertificates}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <Mail className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCertificates > 0 ? Math.round((completedCertificates / totalCertificates) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Operations</h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={processBatch}
            disabled={isProcessing || completedCertificates === totalCertificates}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Play className="w-5 h-5" />
            <span>{isProcessing ? 'Processing...' : 'Generate All Certificates'}</span>
          </button>
          
          <button
            onClick={handleExportData}
            disabled={completedCertificates === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Export Batch Data</span>
          </button>
        </div>

        {isProcessing && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <p className="font-medium text-blue-800">
                Processing: {currentCandidate}
              </p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(processedCount / totalCertificates) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              {processedCount} of {totalCertificates} certificates generated
            </p>
          </div>
        )}
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Candidate List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.courses.map((course, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.certificatesGenerated}/{candidate.courses.length}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(candidate.certificatesGenerated / candidate.courses.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      candidate.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : candidate.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : candidate.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {candidate.courses.map((course, index) => (
                        <button
                          key={index}
                          onClick={() => onPreviewCertificate(candidate, course)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title={`Preview ${course} certificate`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};