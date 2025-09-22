import { ProcessedCandidate } from '../App';

export interface BatchData {
  candidates: {
    name: string;
    email: string;
    courses: string[];
    certificatesGenerated: number;
  }[];
  metadata: {
    totalCandidates: number;
    totalCertificates: number;
    exportDate: string;
    batchId: string;
  };
}

export const exportBatchData = (candidates: ProcessedCandidate[]): void => {
  const batchData: BatchData = {
    candidates: candidates
      .filter(c => c.status === 'completed')
      .map(candidate => ({
        name: candidate.name,
        email: candidate.email,
        courses: candidate.processedCourses,
        certificatesGenerated: candidate.certificatesGenerated
      })),
    metadata: {
      totalCandidates: candidates.length,
      totalCertificates: candidates.reduce((sum, c) => sum + c.certificatesGenerated, 0),
      exportDate: new Date().toISOString(),
      batchId: `batch_${Date.now()}`
    }
  };

  // Create and download JSON file
  const dataStr = JSON.stringify(batchData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `certificate_batch_${batchData.metadata.batchId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
};