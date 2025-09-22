import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AdminLogin } from './components/AdminLogin';
import { Dashboard } from './components/Dashboard';
import { CertificatePreview } from './components/CertificatePreview';
import { Header } from './components/Header';

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

const SUPPORTED_COURSES = [
  'Data Analysis/Analytics',
  'MS Office for Administrators',
  'Python Programming',
  'Cybersecurity'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [candidates, setCandidates] = useState<ProcessedCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ProcessedCandidate | null>(null);
  const [previewCourse, setPreviewCourse] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {!isAuthenticated ? (
        <AdminLogin onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <div className="container mx-auto px-4 py-8 space-y-8">
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