import Papa from 'papaparse';

export interface CSVRow {
  Name: string;
  Email: string;
  Courses: string;
}

export const parseCSVFile = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data as CSVRow[]);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const validateCSVData = (data: CSVRow[]): string[] => {
  const errors: string[] = [];
  const requiredColumns = ['Name', 'Email', 'Courses'];
  
  if (data.length === 0) {
    errors.push('CSV file is empty');
    return errors;
  }

  // Check if all required columns exist
  const firstRow = data[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Validate data quality
  data.forEach((row, index) => {
    if (!row.Name || row.Name.trim() === '') {
      errors.push(`Row ${index + 2}: Missing candidate name`);
    }
    
    if (!row.Email || !row.Email.includes('@')) {
      errors.push(`Row ${index + 2}: Invalid email address`);
    }
    
    if (!row.Courses || row.Courses.trim() === '') {
      errors.push(`Row ${index + 2}: Missing course information`);
    }
  });

  return errors;
};