import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ICSFileUpload from './ICSFileUpload';
import AvailabilitySlotCard from './AvailabilitySlotCard';
import AvailabilityCalendar from './AvailabilityCalendar';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { updateAvailability, getAvailability } from '../../../redux/actions/doctorActions';

interface AvailabilitySlot {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  isFromICS?: boolean;
}

interface AvailabilitySectionProps {
  doctorId?: string;
}

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({ doctorId }) => {
  const dispatch = useAppDispatch();
  const { availability, loading, error, success } = useAppSelector(state => state.doctor);
  
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    dispatch(getAvailability({ doctorId: doctorId || undefined }));
  }, [dispatch, doctorId]);

  useEffect(() => {
    if (availability && availability.length > 0) {
      const availabilitySlots: AvailabilitySlot[] = availability.map(slot => ({
        id: slot._id,
        title: slot.title,
        start: new Date(slot.start),
        end: new Date(slot.end),
        location: slot.location,
        description: slot.description,
        isFromICS: false
      }));
      setSlots(availabilitySlots);
    }
  }, [availability]);

  useEffect(() => {
    if (success && !loading && isSubmitting) {
      toast.success('Availability updated successfully!');
      setIsSubmitting(false);
      setHasChanges(false);
    }
  }, [success, loading, isSubmitting]);

  useEffect(() => {
    if (error && !loading && isSubmitting) {
      toast.error(`Error: ${error}`);
      setIsSubmitting(false);
    }
  }, [error, loading, isSubmitting]);

  const handleFileProcessed = (newSlots: AvailabilitySlot[]) => {
    setSlots(prevSlots => [...prevSlots, ...newSlots]);
    setHasChanges(true);
    toast.info(`${newSlots.length} availability slots added from ICS file`);
  };

  const handleFileError = (error: string) => {
    toast.error(error);
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId));
    setHasChanges(true);
    toast.info('Availability slot removed');
  };

  const handleSubmit = async () => {
    if (slots.length === 0) {
      toast.error('Please add at least one availability slot');
      return;
    }

    setIsSubmitting(true);

    try {
      const slotsByMonth = slots.reduce((acc, slot) => {
        const date = new Date(slot.start);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(slot);
        return acc;
      }, {} as Record<string, AvailabilitySlot[]>);

      const monthGroups = Object.entries(slotsByMonth);

      if (monthGroups.length > 1) {
        toast.info(`Submitting ${monthGroups.length} months of availability separately.`);
      }

      for (const [, monthSlots] of monthGroups) {
        const availabilityData = monthSlots.map(slot => ({
          _id: slot.id || '',
          doctorId: doctorId || '',
          title: slot.title,
          start: slot.start instanceof Date ? slot.start.toISOString() : slot.start,
          end: slot.end instanceof Date ? slot.end.toISOString() : slot.end,
          location: slot.location || '',
          description: slot.description || ''
        }));

        await dispatch(updateAvailability(availabilityData)).unwrap();
      }

      toast.success('All availability slots updated successfully!');
    } catch (err) {
      console.error('Availability update failed:', err);
      toast.error('Failed to update availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    setSlots([]);
    setHasChanges(true);
    toast.info('All availability slots cleared');
  };

  const handleSlotClick = (slot: AvailabilitySlot) => {
    toast.info(`Clicked: ${slot.title} on ${slot.start.toLocaleDateString()}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const slotsOnDate = slots.filter(slot => 
      slot.start.toDateString() === date.toDateString()
    );

    toast.info(
      slotsOnDate.length > 0
        ? `${slotsOnDate.length} availability slot(s) on ${date.toLocaleDateString()}`
        : `No availability slots on ${date.toLocaleDateString()}`
    );
  };

  if (loading && slots.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading availability...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Availability Management</h2>
        <p className="text-gray-600">Upload ICS files or manage your availability slots</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Calendar File</h3>
        <ICSFileUpload
          onFileProcessed={handleFileProcessed}
          onError={handleFileError}
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Current Availability ({slots.length} slots)
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Calendar View
              </button>
            </div>
            {slots.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No availability slots configured</p>
            <p className="text-sm">Upload an ICS file to get started</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid gap-4">
            {slots
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((slot, index) => (
                <AvailabilitySlotCard
                  key={slot.id || index}
                  slot={slot}
                  onDelete={handleDeleteSlot}
                  showActions={!isSubmitting}
                />
              ))}
          </div>
        ) : (
          <AvailabilityCalendar
            slots={slots}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      {viewMode === 'calendar' && selectedDate && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h4>
          {(() => {
            const daySlots = slots.filter(slot =>
              slot.start.toDateString() === selectedDate.toDateString()
            );

            return daySlots.length === 0 ? (
              <p className="text-blue-700 text-sm">No availability slots on this date</p>
            ) : (
              <div className="space-y-2">
                <p className="text-blue-700 text-sm font-medium">
                  {daySlots.length} availability slot{daySlots.length > 1 ? 's' : ''}:
                </p>
                <div className="space-y-1">
                  {daySlots.map((slot, index) => (
                    <div key={index} className="text-sm text-blue-800">
                      • {slot.title} ({slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => {
              dispatch(getAvailability({ doctorId: doctorId || undefined }));
              setHasChanges(false);
              setSelectedDate(null);
              toast.info('Changes discarded');
            }}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Availability'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySection;
