/**
 * Converts app icon to a format React Native Image component can render
 * Handles both base64 strings and URLs
 */
export const getImageSource = (appIcon: string | null | undefined): string | null => {
  if (!appIcon) return null;
  
  // If already a URL (http:// or https://), return as is
  if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
    return appIcon;
  }
  
  // If already has data URI prefix, return as is
  if (appIcon.startsWith('data:image')) {
    return appIcon;
  }
  
  // Assume it's a base64 string, add data URI prefix
  return `data:image/png;base64,${appIcon}`;
};

/**
 * Checks if the icon is a valid base64 or URL
 */
export const isValidIcon = (appIcon: string | null | undefined): boolean => {
  if (!appIcon) return false;
  
  // Check if URL
  if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
    return true;
  }
  
  // Check if data URI
  if (appIcon.startsWith('data:image')) {
    return true;
  }
  
  // Check if looks like base64 (basic check)
  return appIcon.length > 100 && /^[A-Za-z0-9+/=]+$/.test(appIcon.substring(0, 100));
};
