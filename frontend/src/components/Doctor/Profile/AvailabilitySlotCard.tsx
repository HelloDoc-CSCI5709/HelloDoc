import React from 'react';

// Define AvailabilitySlot locally
interface AvailabilitySlot {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  isFromICS?: boolean;
}

interface AvailabilitySlotCardProps {
  slot: AvailabilitySlot;
  onDelete?: (slotId: string) => void;
  onEdit?: (slot: AvailabilitySlot) => void;
  showActions?: boolean;
}

const AvailabilitySlotCard: React.FC<AvailabilitySlotCardProps> = ({
  slot,
  onDelete,
  onEdit,
  showActions = true
}) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getDuration = () => {
    const durationMs = slot.end.getTime() - slot.start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${slot.isFromICS ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-gray-900">{slot.title}</h3>
            {slot.isFromICS && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                From ICS
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Start:</strong> {formatDateTime(slot.start)}</p>
            <p><strong>End:</strong> {formatDateTime(slot.end)}</p>
            <p><strong>Duration:</strong> {getDuration()}</p>
            
            {slot.location && (
              <p><strong>Location:</strong> {slot.location}</p>
            )}
            
            {slot.description && (
              <p><strong>Description:</strong> {slot.description}</p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(slot)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && slot.id && (
              <button
                onClick={() => onDelete(slot.id!)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilitySlotCard;
