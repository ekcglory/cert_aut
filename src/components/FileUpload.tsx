import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import { ProcessedCandidate } from '../App';

interface FileUploadProps {
  onCandidatesLoaded: (candidates: ProcessedCandidate[]) => void;
}

interface RawCandidate {
  Name: string;
  Email: string;
  Courses: string;
}

const SUPPORTED_COURSES = [
  'Data Analysis/Analytics',
  'MS Office for Administrators',
  'Python Programming'
];

export const FileUpload: React.FC<FileUploadProps> = ({ onCandidatesLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const processCandidates = (rawData: RawCandidate[]): ProcessedCandidate[] => {
    return rawData.map((row, index) => {
      const courses = row.Courses.split(',').map(course => course.trim());
      const validCourses = courses.filter(course => 
        SUPPORTED_COURSES.includes(course)
      );

      return {
        id: `candidate-${index}`,
        name: row.Name.trim(),
        email: row.Email.trim(),
        courses: validCourses,
        processedCourses: [],
        certificatesGenerated: 0,
        status: 'pending' as const
      };
    }).filter(candidate => 
      candidate.name && candidate.email && candidate.courses.length > 0
    );
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setStatusMessage('Please upload a CSV file only.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedCandidates = processCandidates(results.data as RawCandidate[]);
          
          if (processedCandidates.length === 0) {
            setUploadStatus('error');
            setStatusMessage('No valid candidates found. Please check your CSV format.');
          } else {
            onCandidatesLoaded(processedCandidates);
            setUploadStatus('success');
            setStatusMessage(`Successfully loaded ${processedCandidates.length} candidates`);
          }
        } catch (error) {
          setUploadStatus('error');
          setStatusMessage('Error processing CSV file. Please check the format.');
        }
        setIsProcessing(false);
      },
      error: (error) => {
        setUploadStatus('error');
        setStatusMessage(`Error reading file: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, [onCandidatesLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setStatusMessage('');
    onCandidatesLoaded([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Candidate Data</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Columns: Name, Email, Courses</li>
            <li>• Multiple courses separated by commas</li>
            <li>• Supported courses: Data Analysis/Analytics, MS Office for Administrators, Python Programming</li>
          </ul>
        </div>

        {uploadStatus === 'idle' && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop your CSV file here' : 'Upload Candidate CSV'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 cursor-pointer transition-colors duration-200">
              <FileText className="w-5 h-5 mr-2" />
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        )}

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-blue-800 font-medium">Processing CSV file...</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Upload Successful</p>
                  <p className="text-sm text-green-700">{statusMessage}</p>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Upload Failed</p>
                  <p className="text-sm text-red-700">{statusMessage}</p>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};