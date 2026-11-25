export const hikePhotoLimit = 5;
export const hikePhotoLimitBytes = 10 * 1024 * 1024;

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedHikePhoto(file: File) {
  return imageTypes.has(file.type) && file.size <= hikePhotoLimitBytes;
}

export function availableHikePhotoSlots(count: number) {
  return Math.max(0, hikePhotoLimit - count);
}
