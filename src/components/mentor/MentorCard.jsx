/**
 * Mentor Card Component
 * Displays mentor profile information (name, avatar, skills, rating, availability)
 * Used in the swipe deck and mentor selection screens
 * Features glassmorphism, smooth hover effects and responsive layout
 */

import { Star, Zap, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import { getAvatar } from '../../utils/avatar';

export default function MentorCard({ mentor, onBook, onViewProfile }) {
  // Calculate average rating from ratingSum and totalRatings
  const averageRating = mentor.totalRatings > 0 
    ? (mentor.ratingSum / mentor.totalRatings).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover group">
      {/* Mentor Avatar with gradient overlay */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-400 to-pink-400 overflow-hidden">
        <img
          src={getAvatar(mentor.avatar, mentor.name, 400)}
          alt={mentor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Badge Score — floating pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
          <span className="text-yellow-500">⭐</span> {mentor.badgeScore}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {mentor.name}
        </h3>

        {/* Location */}
        {mentor.location?.state && (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{mentor.location.state}, {mentor.location.district}</span>
          </div>
        )}

        {/* Rating and Sessions row */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{averageRating}</span>
            <span className="text-xs text-gray-400">({mentor.totalRatings})</span>
          </div>
          <div className="flex items-center text-sm text-indigo-600 font-semibold">
            <Zap className="h-3.5 w-3.5 mr-1 fill-indigo-600" />
            {mentor.totalSessions} sessions
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {mentor.bio || 'Passionate mentor ready to teach!'}
        </p>

        {/* Skills as colorful pills */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {mentor.skillsOffered?.slice(0, 3).map((skill, i) => (
              <span 
                key={i}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100"
              >
                {skill}
              </span>
            ))}
            {mentor.skillsOffered?.length > 3 && (
              <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-semibold border border-gray-100">
                +{mentor.skillsOffered.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="w-full"
          >
            Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onBook}
            className="w-full"
          >
            Book Session
          </Button>
        </div>
      </div>
    </div>
  );
}
