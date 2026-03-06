/**
 * Rating Modal Component
 * Appears after a session ends to let users rate each other
 * Score: 1-5 stars + optional feedback text
 */

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { ratingAPI } from '../../services/apiService';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { getAvatar } from '../../utils/avatar';
import toast from 'react-hot-toast';

export default function RatingModal({ sessionData, onClose }) {
  const { user } = useAuthStore();

  // Determine who we're rating (the other person)
  const ratedUser = sessionData?.mentor?._id === user._id 
    ? sessionData?.learner 
    : sessionData?.mentor;

  // State
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit rating
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await ratingAPI.submitRating(sessionData._id, {
        ratedUserId: ratedUser._id,
        score: rating,
        feedback,
      });

      toast.success('Rating submitted! Thanks 🎉');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Rate Your Session</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Session Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <img
            src={getAvatar(ratedUser?.avatar, ratedUser?.name, 48)}
            alt={ratedUser?.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{ratedUser?.name}</p>
            <p className="text-sm text-gray-600">
              {sessionData?.skill} • {sessionData?.duration} min session
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            How was your experience?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Below Average'}
            {rating === 3 && 'Average'}
            {rating === 4 && 'Good'}
            {rating === 5 && 'Excellent!'}
          </p>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Feedback (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none h-24"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            Skip
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            loading={loading}
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </div>
  );
}
