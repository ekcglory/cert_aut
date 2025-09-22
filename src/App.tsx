import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ManualEntryForm } from './components/ManualEntryForm';
import { AdminLogin } from './components/AdminLogin';
import { Dashboard } from './components/Dashboard';
import { CertificatePreview } from './components/CertificatePreview';
import { Header } from './components/Header';
import { SUPPORTED_COURSES } from './utils/constants';

export interface Candidate {
  name: string;
  email: string;
  courses: string[];
}

export interface ProcessedCandidate extends Candidate {
  id: string;
  processedCourses: string[];
  certificatesGenerated: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

type ViewMode = 'bulk' | 'manual';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('bulk');
  const [candidates, setCandidates] = useState<ProcessedCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ProcessedCandidate | null>(null);
  const [previewCourse, setPreviewCourse] = useState<string>('');

  const handleManualCertificateGeneration = (candidate: ProcessedCandidate, course: string) => {
    setSelectedCandidate(candidate);
    setPreviewCourse(course);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {!isAuthenticated ? (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Mode Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setViewMode('bulk')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'bulk'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Upload
              </button>
              <button
                onClick={() => setViewMode('manual')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'manual'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>

          {/* Bulk Upload Mode */}
          {viewMode === 'bulk' && (
            <>
              <FileUpload 
                onCandidatesLoaded={setCandidates}
              />
              
              {candidates.length > 0 && (
                <Dashboard 
                  candidates={candidates}
                  setCandidates={setCandidates}
                  onPreviewCertificate={(candidate, course) => {
                    setSelectedCandidate(candidate);
                    setPreviewCourse(course);
                  }}
                />
              )}
            </>
          )}

          {/* Manual Entry Mode */}
          {viewMode === 'manual' && (
            <ManualEntryForm 
              onGenerateCertificate={handleManualCertificateGeneration}
            />
          )}
          {/* Certificate Preview Modal */}
          {selectedCandidate && previewCourse && (
            <CertificatePreview
              candidate={selectedCandidate}
              course={previewCourse}
              onClose={() => {
                setSelectedCandidate(null);
                setPreviewCourse('');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;