export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export class FileValidator {
  static validateCredentialFile(file: File): FileValidationResult {
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Only PDF files are allowed for medical credentials'
      };
    }

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    if (!file.name || file.name.trim() === '') {
      return {
        isValid: false,
        error: 'File must have a valid name'
      };
    }

    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com'];
    const fileName = file.name.toLowerCase();
    
    for (const ext of dangerousExtensions) {
      if (fileName.includes(ext)) {
        return {
          isValid: false,
          error: 'File type not allowed for security reasons'
        };
      }
    }

    return { isValid: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
}
