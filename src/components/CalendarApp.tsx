
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Plus, Trash, Clock } from 'lucide-react';

interface CalendarAppProps {
  userId: string;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
}

const CalendarApp: React.FC<CalendarAppProps> = ({ userId }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem(`webOS_calendar_events_${userId}`);
    return savedEvents ? JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      date: new Date(event.date)
    })) : [];
  });
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    time: '',
    description: ''
  });
  
  useEffect(() => {
    localStorage.setItem(`webOS_calendar_events_${userId}`, JSON.stringify(events));
  }, [events, userId]);
  
  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "Title required",
        description: "Please enter a title for the event",
        variant: "destructive"
      });
      return;
    }
    
    const event: Event = {
      id: `event-${Date.now()}`,
      ...newEvent
    };
    
    setEvents([...events, event]);
    setIsAddEventOpen(false);
    setNewEvent({
      title: '',
      date: new Date(),
      time: '',
      description: ''
    });
    
    toast({
      title: "Event added",
      description: "Your event has been added to the calendar"
    });
  };
  
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setSelectedEvent(null);
    
    toast({
      title: "Event deleted",
      description: "The event has been removed from your calendar"
    });
  };
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  const eventsForSelectedDate = events.filter(event => isSameDay(event.date, date));
  
  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleMonthChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            size="sm" 
            onClick={() => {
              setNewEvent({
                title: '',
                date: date,
                time: '',
                description: ''
              });
              setIsAddEventOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 space-x-4">
        {/* Calendar */}
        <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border"
          />
        </div>
        
        {/* Events for Selected Date */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-auto">
          <h3 className="text-lg font-medium mb-4">{formatDate(date)}</h3>
          
          {eventsForSelectedDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Clock className="h-12 w-12 mb-2 opacity-20" />
              <p>No events scheduled for this day</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => {
                  setNewEvent({
                    title: '',
                    date: date,
                    time: '',
                    description: ''
                  });
                  setIsAddEventOpen(true);
                }}
              >
                Add Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {eventsForSelectedDate.map(event => (
                <div 
                  key={event.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    {event.time && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {event.time}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input 
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={newEvent.date}
                  onSelect={(date) => date && setNewEvent({...newEvent, date})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time (optional)</label>
              <Input 
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                className="w-full p-2 border rounded-md resize-none h-20"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Enter event description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Event Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Date:</span>
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              
              {selectedEvent.time && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Time:</span>
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <span className="text-sm font-medium block mb-1">Description:</span>
                  <p className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                <Trash className="h-4 w-4 mr-1" /> Delete
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CalendarApp;
