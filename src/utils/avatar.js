/**
 * Avatar Utility
 * Generates fallback avatar URLs using ui-avatars.com (free, no API key needed)
 * Returns a colored avatar with user's initials when no custom avatar is set
 */

/**
 * Get a fallback avatar URL based on user's name
 * @param {string} name - The user's display name (used for initials)
 * @param {number} size - Image size in pixels (default: 128)
 * @returns {string} Avatar URL
 */
export function getAvatarUrl(name = 'User', size = 128) {
  const encoded = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encoded}&size=${size}&background=6366f1&color=fff&bold=true&format=svg`;
}

/**
 * Get avatar src — uses user's uploaded avatar if available, otherwise generates one
 * @param {string|undefined} avatar - User's custom avatar URL (may be undefined)
 * @param {string} name - User's display name
 * @param {number} size - Desired image size
 * @returns {string} Final avatar URL to use in <img> tags
 */
export function getAvatar(avatar, name = 'User', size = 128) {
  return avatar || getAvatarUrl(name, size);
}
