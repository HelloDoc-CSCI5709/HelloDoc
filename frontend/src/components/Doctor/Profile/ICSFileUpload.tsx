import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { ICSParser } from './icsParser';

// Define ICS event and availability types
interface ICSEvent {
  summary: string;
  start: Date | string;
  end: Date | string;
  location?: string;
  description?: string;
}

interface AvailabilitySlot {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  isFromICS?: boolean;
}

interface ICSFileData {
  file: File;
  events: ICSEvent[];
  totalSlots: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface ICSFileUploadProps {
  onFileProcessed: (slots: AvailabilitySlot[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const ICSFileUpload: React.FC<ICSFileUploadProps> = ({
  onFileProcessed,
  onError,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState<ICSFileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics')) {
      onError('Please select a valid ICS calendar file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('File size must be less than 5MB');
      return;
    }

    setIsProcessing(true);

    try {
      const icsData = await ICSParser.parseICSFile(file);
      setFileInfo(icsData);

      const slots: AvailabilitySlot[] = icsData.events.map((event, index) => ({
        id: `ics-${index}`,
        title: event.summary,
        start: event.start instanceof Date ? event.start : new Date(event.start),
        end: event.end instanceof Date ? event.end : new Date(event.end),
        location: event.location,
        description: event.description,
        isFromICS: true
      }));

      onFileProcessed(slots);
      toast.success(`Successfully parsed ${slots.length} availability slots from ICS file`);
    } catch (error) {
      console.error('ICS parsing error:', error);
      onError(`Failed to parse ICS file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFileInfo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📅</div>
          <div className="mb-4">
            <label
              htmlFor="ics-upload"
              className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Upload ICS File'}
            </label>
            <input
              id="ics-upload"
              ref={fileInputRef}
              type="file"
              accept=".ics"
              onChange={handleFileSelect}
              disabled={disabled || isProcessing}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-600">
            Upload your calendar file (.ics) to import availability slots
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: Google Calendar, Outlook, Apple Calendar
          </p>
        </div>
      </div>

      {fileInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">File Processed Successfully</h3>
            <button
              onClick={handleClearFile}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>File:</strong> {fileInfo.file.name}</p>
            <p><strong>Total Slots:</strong> {fileInfo.totalSlots}</p>
            <p><strong>Date Range:</strong> {fileInfo.dateRange.start.toLocaleDateString()} - {fileInfo.dateRange.end.toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Processing ICS file...</span>
        </div>
      )}
    </div>
  );
};

export default ICSFileUpload;
