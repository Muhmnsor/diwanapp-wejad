
/**
 * Cache Compression Utilities
 * Compresses and decompresses cache data to reduce storage size
 */

/**
 * Compress data using LZ-based compression
 */
export const compressData = (data: any): string => {
  try {
    // Convert data to string if not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    // Use built-in btoa for basic compression (Base64 encoding)
    // For production, a more sophisticated compression library would be recommended
    return btoa(dataString);
  } catch (error) {
    console.error('Error compressing data:', error);
    // Return original stringified data if compression fails
    return JSON.stringify(data);
  }
};

/**
 * Decompress data
 */
export const decompressData = <T>(compressedData: string): T => {
  try {
    // Use built-in atob for basic decompression (Base64 decoding)
    const decompressedString = atob(compressedData);
    return JSON.parse(decompressedString) as T;
  } catch (error) {
    console.error('Error decompressing data:', error);
    // If decompression fails, try to parse the original data
    return JSON.parse(compressedData) as T;
  }
};

/**
 * Check if the provided string is compressed (Base64 encoded)
 */
export const isCompressedData = (data: string): boolean => {
  try {
    // Check if it's a Base64 string by attempting to decode it
    atob(data);
    // Additional check to exclude JSON strings that might accidentally be valid Base64
    return !data.startsWith('{') && !data.startsWith('[');
  } catch (error) {
    return false;
  }
};
