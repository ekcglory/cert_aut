import React, { useEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { ProcessedCandidate } from '../App';
import { generateCertificatePDF } from '../utils/certificateGenerator';

interface CertificatePreviewProps {
  candidate: ProcessedCandidate;
  course: string;
  onClose: () => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  candidate,
  course,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderCertificate = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match certificate proportions
      canvas.width = 1200;
      canvas.height = 850;

      try {
        // Load the header background image
        const headerImg = new Image();
        headerImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          headerImg.onload = resolve;
          headerImg.onerror = reject;
          headerImg.src = '/header.png';
        });

        // Draw the header background image
        ctx.drawImage(headerImg, 0, 0, canvas.width, 250);

        // Load and draw the badge/medal
        const badgeImg = new Image();
        badgeImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          badgeImg.onload = resolve;
          badgeImg.onerror = reject;
          badgeImg.src = '/badgesv-01.svg';
        });

        // Draw the badge on the left side
        ctx.drawImage(badgeImg, 80, 350, 150, 150);

        // White content area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 250, canvas.width, canvas.height - 250);

        // Main content text
        ctx.fillStyle = '#000000';
        ctx.font = 'normal 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('THIS IS TO CERTIFY THAT', canvas.width / 2, 320);

        // Candidate name (prominent green text)
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(candidate.name.toUpperCase(), canvas.width / 2, 400);

        // Course completion text
        ctx.fillStyle = '#000000';
        ctx.font = 'normal 18px Arial';
        
        // Format course name for display
        let formattedCourse = course.toUpperCase();
        if (course === 'Python Programming') {
          formattedCourse = 'INTRODUCTION TO PYTHON PROGRAMMING';
        } else if (course === 'Data Analysis/Analytics') {
          formattedCourse = 'DATA ANALYSIS/ANALYTICS';
        } else if (course === 'MS Office for Administrators') {
          formattedCourse = 'MS OFFICE FOR ADMINISTRATORS';
        }

        const courseText = `has successfully completed the ${formattedCourse}`;
        ctx.fillText(courseText, canvas.width / 2, 460);
        
        ctx.fillText('Course, conducted by Bourdillon Omijeh', canvas.width / 2, 490);
        ctx.fillText('Foundation (BOF), Cohort 1 on the 20th July, 2025.', canvas.width / 2, 520);

        // Load and draw the signature
        const signImg = new Image();
        signImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          signImg.onload = resolve;
          signImg.onerror = reject;
          signImg.src = '/sign.png';
        });

        // Draw signature
        ctx.drawImage(signImg, canvas.width / 2 - 100, 580, 200, 80);

        // Signature text
        ctx.fillStyle = '#000000';
        ctx.font = 'normal 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('President, Bourdillon Omijeh', canvas.width / 2, 690);
        ctx.fillText('Foundation (BOF)', canvas.width / 2, 710);

      } catch (error) {
        console.error('Error loading certificate assets:', error);
        
        // Fallback rendering without images
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(0, 0, canvas.width, 250);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 250, canvas.width, canvas.height - 250);
        
        // Header text fallback
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('CERTIFICATE', 80, 100);
        
        ctx.font = 'normal 24px Arial';
        ctx.fillText('OF COMPLETION', 80, 140);

        // B.O.F branding fallback
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('B.O.F', canvas.width - 80, 100);
        ctx.font = 'normal 12px Arial';
        ctx.fillText('Bourdillon Omijeh Foundation', canvas.width - 80, 120);

        // Content fallback
        ctx.fillStyle = '#000000';
        ctx.font = 'normal 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('THIS IS TO CERTIFY THAT', canvas.width / 2, 320);

        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 42px Arial';
        ctx.fillText(candidate.name.toUpperCase(), canvas.width / 2, 400);

        ctx.fillStyle = '#000000';
        ctx.font = 'normal 20px Arial';
        const courseText = `has successfully completed the ${course.toUpperCase()}`;
        ctx.fillText(courseText, canvas.width / 2, 460);
        
        ctx.fillText('Course, conducted by Bourdillon Omijeh', canvas.width / 2, 490);
        ctx.fillText('Foundation (BOF), Cohort 1 on the 20th July, 2025.', canvas.width / 2, 520);

        // Signature line fallback
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 100, 650);
        ctx.lineTo(canvas.width / 2 + 100, 650);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'italic 24px Arial';
        ctx.fillText('Bourdillon Omijeh', canvas.width / 2, 680);
        
        ctx.font = 'normal 16px Arial';
        ctx.fillText('President, Bourdillon Omijeh Foundation (BOF)', canvas.width / 2, 705);
      }
    };

    renderCertificate();
  }, [candidate, course]);

  const handleDownload = async () => {
    await generateCertificatePDF(candidate, course);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Certificate Preview</h3>
            <p className="text-gray-600">{candidate.name} - {course}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-lg shadow-sm max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};