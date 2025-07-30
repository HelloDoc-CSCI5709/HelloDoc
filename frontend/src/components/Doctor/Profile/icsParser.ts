interface ICSEvent {
  summary: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  uid: string;
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

export class ICSParser {
  static async parseICSFile(file: File): Promise<ICSFileData> {
    const text = await file.text();
    const events = this.parseICSText(text);
    
    if (events.length === 0) {
      throw new Error('No valid events found in ICS file');
    }

    const dates = events.map(e => e.start);
    const dateRange = {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };

    return {
      file,
      events,
      totalSlots: events.length,
      dateRange
    };
  }

  private static parseICSText(text: string): ICSEvent[] {
    const events: ICSEvent[] = [];
    const lines = text.split('\n').map(line => line.trim());
    
    let currentEvent: Partial<ICSEvent> = {};
    let inEvent = false;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT') {
        if (this.isValidEvent(currentEvent)) {
          events.push(currentEvent as ICSEvent);
        }
        inEvent = false;
      } else if (inEvent) {
        this.parseLine(line, currentEvent);
      }
    }

    return events;
  }

  private static parseLine(line: string, event: Partial<ICSEvent>): void {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':');

    switch (key.split(';')[0]) {
      case 'SUMMARY':
        event.summary = value;
        break;
      case 'DTSTART':
        event.start = this.parseDateTime(value);
        break;
      case 'DTEND':
        event.end = this.parseDateTime(value);
        break;
      case 'LOCATION':
        event.location = value;
        break;
      case 'DESCRIPTION':
        event.description = value;
        break;
      case 'UID':
        event.uid = value;
        break;
    }
  }

  private static parseDateTime(dateTimeStr: string): Date {
    // Handle different datetime formats and ensure valid Date object
    try {
      if (dateTimeStr.includes('T')) {
        // ISO format: 20241201T100000Z or 20241201T100000
        const cleanStr = dateTimeStr.replace(/[TZ]/g, '');
        const year = parseInt(cleanStr.substring(0, 4));
        const month = parseInt(cleanStr.substring(4, 6)) - 1;
        const day = parseInt(cleanStr.substring(6, 8));
        const hour = parseInt(cleanStr.substring(8, 10)) || 0;
        const minute = parseInt(cleanStr.substring(10, 12)) || 0;
        const second = parseInt(cleanStr.substring(12, 14)) || 0;
        
        // Validate parsed values
        if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
          throw new Error(`Invalid date components: ${year}-${month+1}-${day}`);
        }
        
        return new Date(year, month, day, hour, minute, second);
      } else {
        // Date only format: 20241201
        const year = parseInt(dateTimeStr.substring(0, 4));
        const month = parseInt(dateTimeStr.substring(4, 6)) - 1;
        const day = parseInt(dateTimeStr.substring(6, 8));
        
        // Validate parsed values
        if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
          throw new Error(`Invalid date components: ${year}-${month+1}-${day}`);
        }
        
        return new Date(year, month, day);
      }
    } catch (error) {
      console.warn(`Failed to parse date: ${dateTimeStr}`, error);
      // Return current date as fallback
      return new Date();
    }
  }

  private static isValidEvent(event: Partial<ICSEvent>): boolean {
    return !!(event.summary && event.start && event.end && event.uid);
  }
}
