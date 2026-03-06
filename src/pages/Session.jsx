/**
 * Session Booking Page
 * Book a session with a mentor and manage upcoming sessions
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { sessionAPI } from '../services/apiService';
import { getAvatar } from '../utils/avatar';
import toast from 'react-hot-toast';

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const mentor = location.state?.mentor;
  const skill = location.state?.skill;

  // Form state
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // If no mentor passed, show error
  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No mentor selected</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Check mentor availability when date changes
  useEffect(() => {
    if (sessionDate) {
      checkAvailability();
    }
  }, [sessionDate]);

  // Check mentor's availability for selected date
  const checkAvailability = async () => {
    setCheckingAvailability(true);
    try {
      // This would call the availability API
      // For now, mock available slots
      const slots = generateTimeSlots(sessionDate);
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Generate time slots (9 AM to 9 PM, 1-hour blocks)
  const generateTimeSlots = (date) => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      const time = `${String(hour).padStart(2, '0')}:00`;
      slots.push({
        time,
        available: Math.random() > 0.3, // Mock: 70% availability
      });
    }
    return slots;
  };

  // Validate and book session
  const handleBookSession = async (e) => {
    e.preventDefault();

    if (!sessionDate || !sessionTime) {
      toast.error('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${sessionDate}T${sessionTime}:00`);

      const response = await sessionAPI.bookSession({
        mentorId: mentor._id,
        skill: skill || mentor.skillsOffered[0],
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(duration),
        notes,
      });

      toast.success('Session booked! 🎉');
      navigate('/sessions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = mentor.totalRatings > 0
    ? (mentor.ratingSum / mentor.totalRatings).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Book a Session</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleBookSession} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Session Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              {sessionDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    <Clock className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Select Time
                  </label>

                  {checkingAvailability ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSessionTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg font-medium text-sm transition-colors ${
                            sessionTime === slot.time
                              ? 'bg-indigo-600 text-white'
                              : slot.available
                              ? 'bg-gray-100 text-gray-900 hover:bg-indigo-50'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell the mentor what you want to learn..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none h-24"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Book Session
              </Button>
            </form>
          </div>

          {/* Mentor Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-20">
              {/* Mentor Image */}
              <img
                src={getAvatar(mentor.avatar, mentor.name, 300)}
                alt={mentor.name}
                className="w-full h-48 object-cover"
              />

              {/* Mentor Info */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">⭐ {avgRating}</span>
                  <span className="text-sm text-gray-600">({mentor.totalRatings} ratings)</span>
                </div>

                {/* Badge Score */}
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-xs text-gray-600">Badge Score</p>
                    <p className="font-bold text-gray-900">{mentor.badgeScore}</p>
                  </div>
                </div>

                {/* Sessions */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="text-xs text-gray-600">Sessions Completed</p>
                    <p className="font-bold text-gray-900">{mentor.totalSessions}</p>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Teaches</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skillsOffered?.slice(0, 3).map(s => (
                      <span
                        key={s}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600">{mentor.bio}</p>

                {/* Booking Info */}
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">Booking Details:</p>
                  <p className="text-gray-600">
                    • Date: <span className="font-medium">{sessionDate || 'Not selected'}</span>
                  </p>
                  <p className="text-gray-600">
                    • Time: <span className="font-medium">{sessionTime || 'Not selected'}</span>
                  </p>
                  <p className="text-gray-600">
                    • Duration: <span className="font-medium">{duration} minutes</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
