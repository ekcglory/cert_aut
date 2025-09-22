import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface CSVRow {
  Name: string;
  Email: string;
  Courses: string;
}

// Normalize column names to handle variations
const normalizeColumnName = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  
  // Map various course column names
  if (normalized.includes('course')) {
    return 'Courses';
  }
  
  // Map name variations
  if (normalized === 'name' || normalized === 'full name' || normalized === 'candidate name') {
    return 'Name';
  }
  
  // Map email variations
  if (normalized === 'email' || normalized === 'email address' || normalized === 'e-mail') {
    return 'Email';
  }
  
  return name;
};

// Convert raw data to standardized format
const normalizeData = (rawData: any[]): CSVRow[] => {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData.map(row => {
    const normalizedRow: any = {};
    
    // Normalize column names
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = row[key];
    });
    
    // Ensure we have the required fields
    const name = normalizedRow.Name || '';
    const email = normalizedRow.Email || '';
    let courses = normalizedRow.Courses || normalizedRow.Course || '';
    
    // Handle course name mapping
    if (courses) {
      courses = courses.toString().split(',').map((course: string) => {
        const trimmedCourse = course.trim();
        
        // Map course variations to standard names
        if (trimmedCourse.toLowerCase().includes('python')) {
          return 'Python Programming';
        }
        if (trimmedCourse.toLowerCase().includes('data') && 
            (trimmedCourse.toLowerCase().includes('analytic') || trimmedCourse.toLowerCase().includes('analysis'))) {
          return 'Data Analysis/Analytics';
        }
        if (trimmedCourse.toLowerCase().includes('microsoft') || 
            trimmedCourse.toLowerCase().includes('ms office') ||
            trimmedCourse.toLowerCase().includes('office')) {
          return 'MS Office for Administrators';
        }
        if (trimmedCourse.toLowerCase().includes('cyber')) {
          return 'Cybersecurity'; // Add new course support
        }
        
        return trimmedCourse;
      }).join(', ');
    }
    
    return {
      Name: name.toString().trim(),
      Email: email.toString().trim(),
      Courses: courses.toString().trim()
    };
  }).filter(row => row.Name && row.Email && row.Courses);
};

export const parseSpreadsheetFile = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      // Handle CSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            try {
              const normalizedData = normalizeData(results.data);
              resolve(normalizedData);
            } catch (error) {
              reject(new Error('Error processing CSV data'));
            }
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    } else if (['xlsx', 'xls', 'ods'].includes(fileExtension || '')) {
      // Handle Excel and OpenDocument files
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Spreadsheet must have at least a header row and one data row'));
            return;
          }
          
          // Convert array format to object format
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || '';
            });
            return obj;
          });
          
          const normalizedData = normalizeData(rows);
          resolve(normalizedData);
        } catch (error) {
          reject(new Error(`Error parsing ${fileExtension?.toUpperCase()} file: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please use CSV, Excel (.xlsx, .xls), or OpenDocument (.ods) files.'));
    }
  });
};

// Keep the old function for backward compatibility
export const parseCSVFile = (file: File): Promise<CSVRow[]> => {
  return parseSpreadsheetFile(file);
};

export const validateCSVData = (data: CSVRow[]): string[] => {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('File is empty or contains no valid data');
    return errors;
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