export type HikeLocationSelection = {
  displayName: string;
  latitude: number;
  longitude: number;
};

export type HikeLocationCoordinates = Pick<HikeLocationSelection, 'latitude' | 'longitude'>;
