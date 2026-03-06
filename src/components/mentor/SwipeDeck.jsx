/**
 * Swipe Deck Component
 * Card swiping interface for discovering mentors
 * Users can swipe left to skip or right to book
 */

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import MentorCard from './MentorCard';
import Button from '../ui/Button';

export default function SwipeDeck({ mentors = [], onBook, onViewProfile, loading = false }) {
  // Current card index
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track swipe position for drag animation
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  if (!mentors || mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-2xl">
        <p className="text-gray-500 text-lg mb-4">
          {loading ? 'Loading mentors...' : 'No mentors found. Try a different skill!'}
        </p>
        {!loading && (
          <Button variant="outline">Try Another Skill</Button>
        )}
      </div>
    );
  }

  const currentMentor = mentors[currentIndex];

  // Handle next card
  const handleNext = () => {
    if (currentIndex < mentors.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSwipeOffset(0);
    }
  };

  // Handle previous card
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSwipeOffset(0);
    }
  };

  // Handle skip (left swipe equivalent)
  const handleSkip = () => {
    handleNext();
  };

  // Handle book (right swipe equivalent)
  const handleBookMentor = (mentor) => {
    onBook(mentor);
  };

  // Mouse/Touch dragging for swipe effect
  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || e.touches?.[0].clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || e.touches?.[0].clientX;
    const diff = currentX - dragStartX.current;
    setSwipeOffset(diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Threshold for swipe (100px)
    if (swipeOffset > 100) {
      // Swiped right - book mentor
      handleBookMentor(currentMentor);
      setSwipeOffset(0);
    } else if (swipeOffset < -100) {
      // Swiped left - skip mentor
      handleSkip();
      setSwipeOffset(0);
    } else {
      // Not enough movement - reset
      setSwipeOffset(0);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Container */}
      <div
        className="relative h-96 mb-6"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Cards Stack */}
        {mentors.map((mentor, index) => {
          // Only show current and next card
          if (index < currentIndex || index > currentIndex) {
            return null;
          }

          const isActive = index === currentIndex;
          const offset = (index - currentIndex) * 20;

          return (
            <div
              key={mentor._id}
              className="absolute top-0 left-0 right-0 transition-all duration-300"
              style={{
                opacity: isActive ? 1 : 0.5,
                transform: `translateY(${offset}px) ${
                  isActive ? `translateX(${swipeOffset}px)` : ''
                }`,
                zIndex: isActive ? 10 : 5,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <MentorCard
                mentor={mentor}
                onBook={() => handleBookMentor(mentor)}
                onViewProfile={() => onViewProfile(mentor)}
              />
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          {currentIndex + 1} of {mentors.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div
            className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / mentors.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-14 h-14 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
            title="Skip - Swipe Left"
          >
            <ThumbsDown className="h-6 w-6" />
          </button>

          {/* Book Button */}
          <button
            onClick={() => handleBookMentor(currentMentor)}
            className="w-14 h-14 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
            title="Book - Swipe Right"
          >
            <ThumbsUp className="h-6 w-6" />
          </button>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === mentors.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Swipe Hint */}
      <p className="text-center text-xs text-gray-500 mt-4">
        💡 Drag cards left/right or use buttons to navigate
      </p>
    </div>
  );
}
