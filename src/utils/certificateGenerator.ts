import jsPDF from 'jspdf';
import { ProcessedCandidate } from '../App';

// Helper function to load image as base64
const loadImageAsBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const generateCertificatePDF = async (
  candidate: ProcessedCandidate, 
  course: string
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Load and add header background
    try {
      const headerBase64 = await loadImageAsBase64('/header.png');
      pdf.addImage(headerBase64, 'PNG', 0, 0, pageWidth, 70);
    } catch (error) {
      console.warn('Could not load header image, using fallback');
      // Fallback: Green header with red stripe
      pdf.setFillColor(22, 163, 74);
      pdf.rect(0, 0, pageWidth, 70, 'F');
      
      pdf.setFillColor(220, 38, 38);
      pdf.rect(0, 55, pageWidth, 15, 'F');
      
      // Header text fallback
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CERTIFICATE', 20, 35);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('OF COMPLETION', 20, 50);

      // B.O.F branding fallback
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('B.O.F', pageWidth - 20, 35, { align: 'right' });
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Bourdillon Omijeh Foundation', pageWidth - 20, 45, { align: 'right' });
    }

    // White content area
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 70, pageWidth, pageHeight - 70, 'F');

    // Load and add badge/medal
    try {
      const badgeBase64 = await loadImageAsBase64('/badgesv-01.svg');
      pdf.addImage(badgeBase64, 'PNG', 20, 100, 40, 40);
    } catch (error) {
      console.warn('Could not load badge image');
      // Simple golden circle fallback
      pdf.setFillColor(251, 191, 36);
      pdf.circle(40, 120, 20, 'F');
    }

    // Main content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.text('THIS IS TO CERTIFY THAT', pageWidth / 2, 100, { align: 'center' });

    // Candidate name
    pdf.setTextColor(22, 163, 74);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text(candidate.name.toUpperCase(), pageWidth / 2, 125, { align: 'center' });

    // Course completion text
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
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
    pdf.text(courseText, pageWidth / 2, 145, { align: 'center' });
    
    pdf.text('Course, conducted by Bourdillon Omijeh', pageWidth / 2, 155, { align: 'center' });
    pdf.text('Foundation (BOF), Cohort 1 on the 20th July, 2025.', pageWidth / 2, 165, { align: 'center' });

    // Load and add signature
    try {
      const signBase64 = await loadImageAsBase64('/sign.png');
      pdf.addImage(signBase64, 'PNG', pageWidth / 2 - 30, 175, 60, 20);
    } catch (error) {
      console.warn('Could not load signature image, using text fallback');
      // Signature line fallback
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth / 2 - 30, 185, pageWidth / 2 + 30, 185);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Bourdillon Omijeh', pageWidth / 2, 195, { align: 'center' });
    }

    // Signature text
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('President, Bourdillon Omijeh', pageWidth / 2, 200, { align: 'center' });
    pdf.text('Foundation (BOF)', pageWidth / 2, 207, { align: 'center' });

    // Save the PDF
    const fileName = `${candidate.name.replace(/\s+/g, '_')}_${course.replace(/\s+/g, '_')}_Certificate.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Failed to generate certificate PDF');
  }
};