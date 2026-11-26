'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Crosshair, Search } from '@boxicons/react';
import { Label, Slider } from '@heroui/react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { HikeLocationCoordinates, HikeLocationSelection } from '../lib/hike-location';

const LocationPickerMap = dynamic(
  () => import('./location-picker-map').then((module) => module.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[280px] place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

type NominatimResult = {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: Record<string, string | undefined>;
};

const minimumGeocodeIntervalMs = 1100;
const defaultMapCenter: HikeLocationCoordinates = { latitude: 12.8797, longitude: 121.774 };

export function LocationPickerDialog({
  open,
  onOpenChange,
  initialLocation,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocation: HikeLocationSelection | null;
  onSelect: (location: HikeLocationSelection) => void;
}) {
  const [query, setQuery] = useState(initialLocation?.displayName ?? '');
  const [coordinates, setCoordinates] = useState<HikeLocationCoordinates>(
    initialLocation ?? defaultMapCenter,
  );
  const [zoom, setZoom] = useState(14);
  const [selectedPlace, setSelectedPlace] = useState<HikeLocationSelection | null>(initialLocation);
  const [hasPendingPin, setHasPendingPin] = useState(!!initialLocation);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [message, setMessage] = useState('Choose where your group should meet.');
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const lastGeocodeRequestAt = useRef(0);
  const autoLocateStarted = useRef(false);

  const requestGeocoder = useCallback(async (url: URL) => {
    const waitMs = Math.max(
      0,
      minimumGeocodeIntervalMs - (Date.now() - lastGeocodeRequestAt.current),
    );
    if (waitMs > 0) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    lastGeocodeRequestAt.current = Date.now();

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok)
      throw new Error('Meeting place search is temporarily unavailable. Try again.');
    return (await response.json()) as NominatimResult[] | NominatimResult;
  }, []);

  const reverseGeocode = useCallback(
    async (nextCoordinates: HikeLocationCoordinates): Promise<HikeLocationSelection | null> => {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('zoom', '18');
      url.searchParams.set('lat', String(nextCoordinates.latitude));
      url.searchParams.set('lon', String(nextCoordinates.longitude));
      const data = await requestGeocoder(url);
      if (Array.isArray(data) || !data.display_name) return null;

      return {
        displayName: formatPlaceAddress(data),
        latitude: nextCoordinates.latitude,
        longitude: nextCoordinates.longitude,
      };
    },
    [requestGeocoder],
  );

  useEffect(() => {
    if (!open) {
      autoLocateStarted.current = false;
      return;
    }

    if (initialLocation) {
      autoLocateStarted.current = true;
      setQuery(initialLocation.displayName);
      setCoordinates(initialLocation);
      setSelectedPlace(initialLocation);
      setHasPendingPin(true);
      setResults([]);
      setMessage(`${initialLocation.displayName} is your current meeting place.`);
      return;
    }

    if (autoLocateStarted.current) return;
    autoLocateStarted.current = true;

    if (!navigator.geolocation) {
      setMessage('Search for a meeting place or choose one on the map.');
      return;
    }

    setIsLocating(true);
    setMessage('Finding your current position…');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: current }) => {
        const nextCoordinates = {
          latitude: current.latitude,
          longitude: current.longitude,
        };
        setCoordinates(nextCoordinates);
        setHasPendingPin(true);
        setMessage('Finding a meeting place nearby…');
        setIsResolving(true);
        try {
          const nearbyPlace = await reverseGeocode(nextCoordinates);
          if (nearbyPlace) {
            setSelectedPlace(nearbyPlace);
            setQuery(nearbyPlace.displayName);
            setMessage(`${nearbyPlace.displayName} found nearby. Confirm or move the pin.`);
          } else {
            setSelectedPlace(null);
            setMessage('Your position is ready. Confirm to find its meeting place name.');
          }
        } catch (error) {
          setSelectedPlace(null);
          setMessage(
            error instanceof Error
              ? error.message
              : 'Could not find a meeting place near you. Move the pin or search instead.',
          );
        } finally {
          setIsLocating(false);
          setIsResolving(false);
        }
      },
      (error) => {
        setMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Search for a meeting place or choose it on the map.'
            : 'Could not get your current position. Search or choose a place on the map.',
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, [initialLocation, open, reverseGeocode]);

  const searchPlaces = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchText = query.trim();
    if (!searchText) {
      setMessage('Enter a place name to search.');
      return;
    }

    setIsSearching(true);
    setMessage('Searching places…');
    setResults([]);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '5');
      url.searchParams.set('q', searchText);
      const data = await requestGeocoder(url);
      const places = Array.isArray(data) ? data : [];
      setResults(places);
      setMessage(
        places.length
          ? 'Choose a search result or place the pin directly on the map.'
          : 'No places found. Try a nearby town or landmark.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Meeting place search is temporarily unavailable. Try again.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  const chooseSearchResult = (result: NominatimResult) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const place = {
      displayName: formatPlaceAddress(result),
      latitude,
      longitude,
    };
    setCoordinates(place);
    setSelectedPlace(place);
    setHasPendingPin(true);
    setQuery(place.displayName);
    setResults([]);
    setMessage(`${place.displayName} selected as the meeting place. Confirm to use it.`);
  };

  const movePin = (nextCoordinates: HikeLocationCoordinates) => {
    setCoordinates(nextCoordinates);
    setSelectedPlace(null);
    setHasPendingPin(true);
    setMessage('Pin moved. Confirm to find the meeting place name and use it.');
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setMessage('This browser does not support location access. Search for a place instead.');
      return;
    }

    setIsLocating(true);
    setMessage('Finding your current position…');
    navigator.geolocation.getCurrentPosition(
      ({ coords: current }) => {
        movePin({ latitude: current.latitude, longitude: current.longitude });
        setMessage('Current position found. Confirm to find the meeting place name and use it.');
        setIsLocating(false);
      },
      (error) => {
        setMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Search for a place or choose it on the map.'
            : 'Could not get your current position. Search for a place or choose it on the map.',
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const confirmLocation = async () => {
    if (selectedPlace) {
      onSelect(selectedPlace);
      onOpenChange(false);
      return;
    }

    if (!hasPendingPin) return;

    setIsResolving(true);
    setMessage('Finding the meeting place name for this pin…');
    try {
      const place = await reverseGeocode(coordinates);
      if (!place) {
        setMessage(
          'Could not find a nearby meeting place name. Move the pin or search for a place.',
        );
        return;
      }

      onSelect(place);
      onOpenChange(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not find a meeting place name for this pin. Try again.',
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/35 backdrop-blur-0 dark:bg-black/55"
        className="flex max-h-[90svh] w-[calc(100%-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg border border-border/70 bg-card p-0 text-card-foreground shadow-2xl"
      >
        <DialogHeader className="shrink-0 border-b border-border/60 bg-card px-5 py-3 pr-14 text-left sm:px-6">
          <DialogTitle className="text-base font-semibold text-card-foreground">
            Pick a meeting place
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          <form
            onSubmit={(event) => void searchPlaces(event)}
            className="mx-auto flex w-full max-w-lg gap-2"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city, trail, or landmark"
              aria-label="Search for a meeting place"
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              disabled={isSearching || isResolving || isLocating}
              aria-label="Search meeting places"
              title="Search meeting places"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-[#17342e] text-white transition-colors hover:bg-[#254f44] disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-[#17342e]"
            >
              {isSearching ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Search pack="filled" className="size-4" aria-hidden="true" />
              )}
            </button>
          </form>

          <div className="relative isolate h-[320px] overflow-hidden rounded-lg border border-border bg-muted">
            <LocationPickerMap
              coordinates={coordinates}
              zoom={zoom}
              onZoomChange={setZoom}
              onMapPick={movePin}
            />
            {results.length > 0 && (
              <div
                role="listbox"
                aria-label="Meeting place search results"
                className="absolute left-1/2 top-0 z-[1000] max-h-36 w-full max-w-lg -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-sm"
              >
                {results.map((result, index) => (
                  <button
                    key={`${result.lat}-${result.lon}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={
                      selectedPlace?.latitude === Number(result.lat) &&
                      selectedPlace.longitude === Number(result.lon)
                    }
                    onClick={() => chooseSearchResult(result)}
                    className="block w-full rounded-md px-3 py-2 text-left text-xs leading-5 transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block font-semibold">{formatPlaceName(result)}</span>
                    <span className="block text-muted-foreground">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={locateMe}
              disabled={isLocating || isResolving}
              className="absolute right-3 top-3 z-[500] inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card/95 px-3 text-xs font-semibold text-card-foreground shadow-md transition-colors hover:bg-card disabled:cursor-wait disabled:opacity-60"
            >
              <Crosshair pack="filled" className="size-3.5" aria-hidden="true" />
              {isLocating ? 'Finding you…' : 'Use my current position'}
            </button>
            <div className="absolute bottom-3 left-1/2 z-[500] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 px-3 py-1">
              <Slider
                aria-label="Map zoom"
                minValue={4}
                maxValue={19}
                step={1}
                value={zoom}
                onChange={(value) => setZoom(Array.isArray(value) ? (value[0] ?? 14) : value)}
                className="w-full gap-1"
              >
                <Label className="text-xs font-semibold text-card-foreground">Map zoom</Label>
                <Slider.Output className="text-xs font-medium text-muted-foreground" />
                <Slider.Track
                  className="h-5 rounded-xl !bg-[#17342e]/20"
                  style={{ backgroundColor: 'rgba(23, 52, 46, 0.2)' }}
                >
                  <Slider.Fill className="!bg-[#17342e]" style={{ backgroundColor: '#17342e' }} />
                  <Slider.Thumb
                    className="!bg-[#17342e] after:!bg-white"
                    style={{ backgroundColor: '#17342e' }}
                  />
                </Slider.Track>
              </Slider>
            </div>
          </div>

          <p role="status" className="min-h-5 text-xs leading-5 text-muted-foreground">
            {message}
          </p>
        </div>

        <DialogFooter className="shrink-0 flex-row justify-between gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirmLocation()}
            disabled={
              isSearching || isResolving || isLocating || (!selectedPlace && !hasPendingPin)
            }
            className="inline-flex h-10 items-center gap-3 rounded-[8px] bg-[#17342e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#254f44] disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-[#17342e]"
          >
            {isResolving ? 'Finding place…' : 'Use this meeting place'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatPlaceName(result: NominatimResult) {
  const address = result.address;
  const locality =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.hamlet ??
    address?.county ??
    address?.state;
  const name = result.name?.trim();

  if (name) return name;
  if (locality) return locality;
  return result.display_name.split(',')[0]?.trim() || 'Selected location';
}

function formatPlaceAddress(result: NominatimResult) {
  return result.display_name.trim() || formatPlaceName(result);
}
