import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Check, X, Plus } from 'lucide-react';
import { scheduleMeeting, getMeetings, updateMeetingStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface Meeting {
  _id: string;
  organizer: { _id: string; name: string; email: string };
  attendee: { _id: string; name: string; email: string };
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ attendeeId: '', date: '', time: '' });
  const { user } = useAuth();

  const fetchMeetings = async () => {
    try {
      const { data } = await getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      await scheduleMeeting({
        attendeeId: formData.attendeeId,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      setShowForm(false);
      setFormData({ attendeeId: '', date: '', time: '' });
      fetchMeetings();
      alert('Meeting Scheduled!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to schedule');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateMeetingStatus(id, status);
      fetchMeetings();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your video conferences</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowForm(!showForm)}>
          Schedule Meeting
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">New Meeting Details</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendee User ID</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  placeholder="Paste User ID here"
                  value={formData.attendeeId}
                  onChange={(e) => setFormData({ ...formData, attendeeId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <Button type="submit">Confirm Schedule</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting._id}>
            <CardBody>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Video className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Meeting with {meeting.organizer._id === user?.id ? meeting.attendee.name : meeting.organizer.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(meeting.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {meeting.status === 'pending' && (
                    <Badge variant="warning">Pending</Badge>
                  )}
                  {meeting.status === 'accepted' && (
                    <Badge variant="success">Confirmed</Badge>
                  )}
                  {meeting.status === 'rejected' && (
                    <Badge variant="error">Rejected</Badge>
                  )}

                  {meeting.status === 'pending' && meeting.attendee._id === user?.id && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatusUpdate(meeting._id, 'accepted')}>
                        <Check size={18} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleStatusUpdate(meeting._id, 'rejected')}>
                        <X size={18} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {meetings.length === 0 && (
            <p className="text-gray-500">No meetings scheduled.</p>
        )}
      </div>
    </div>
  );
};