'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Crop } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CropMode = 'fit' | 'crop';

export function HikeImageCropDialog({
  open,
  imageFile,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  imageFile: File | null;
  onOpenChange: (open: boolean) => void;
  onApply: (file: File) => void;
}) {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [cropMode, setCropMode] = useState<CropMode>('fit');
  const [zoom, setZoom] = useState(1);
  const [horizontalPosition, setHorizontalPosition] = useState(50);
  const [verticalPosition, setVerticalPosition] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const cropViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setSourceUrl(null);
      setNaturalSize(null);
      return;
    }

    setNaturalSize(null);
    const previewUrl = URL.createObjectURL(imageFile);
    setSourceUrl(previewUrl);
    setCropMode('fit');
    setZoom(1);
    setHorizontalPosition(50);
    setVerticalPosition(50);
    setError(null);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    const viewport = cropViewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const bounds = viewport.getBoundingClientRect();
      setViewportSize({ width: bounds.width, height: bounds.height });
    };

    updateViewportSize();
    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [open, sourceUrl]);

  const coverScale =
    naturalSize && viewportSize.width && viewportSize.height
      ? Math.max(viewportSize.width / naturalSize.width, viewportSize.height / naturalSize.height) *
        zoom
      : 1;
  const cropImageWidth = naturalSize ? naturalSize.width * coverScale : 0;
  const cropImageHeight = naturalSize ? naturalSize.height * coverScale : 0;

  const applyImage = async () => {
    if (!imageFile || !sourceUrl) return;
    if (cropMode === 'fit') {
      onApply(imageFile);
      onOpenChange(false);
      return;
    }

    if (!naturalSize || !cropViewportRef.current) return;

    try {
      const viewport = cropViewportRef.current.getBoundingClientRect();
      const aspectRatio = viewport.width / viewport.height;
      let cropWidth = naturalSize.width;
      let cropHeight = naturalSize.height;

      if (cropWidth / cropHeight > aspectRatio) cropWidth = cropHeight * aspectRatio;
      else cropHeight = cropWidth / aspectRatio;

      cropWidth /= zoom;
      cropHeight /= zoom;

      const cropX = (naturalSize.width - cropWidth) * (horizontalPosition / 100);
      const cropY = (naturalSize.height - cropHeight) * (verticalPosition / 100);
      const outputScale = Math.min(1, 2048 / Math.max(cropWidth, cropHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(cropWidth * outputScale));
      canvas.height = Math.max(1, Math.round(cropHeight * outputScale));

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');

      const sourceImage = new window.Image();
      sourceImage.src = sourceUrl;
      await sourceImage.decode();
      context.drawImage(
        sourceImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const mimeType = imageFile.type || 'image/jpeg';
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, 0.92),
      );
      if (!blob) throw new Error('Could not create the cropped image');

      const extension =
        mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      const baseName = imageFile.name.replace(/\.[^.]+$/, '');
      onApply(new File([blob], `${baseName}-cropped.${extension}`, { type: mimeType }));
      onOpenChange(false);
    } catch {
      setError('The image could not be cropped. Try fitting the whole photo instead.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/45 backdrop-blur-sm dark:bg-black/70"
        className="flex max-h-[94svh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-y-auto rounded-xl border border-[#dce5dd] bg-[#fcfdfb] p-0 text-[#203a2e] shadow-2xl dark:border-white/10 dark:bg-[#142923] dark:text-white"
      >
        <DialogHeader className="shrink-0 border-b border-[#edf0ec] px-5 py-4 pr-14 text-left dark:border-white/10 sm:px-6">
          <DialogTitle className="text-base font-semibold text-[#213b30] dark:text-[#edf4ef]">
            Adjust image
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-5 text-[#718176] dark:text-white/55">
            Fit the complete photo or crop it to fill the frame.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          <div className="inline-flex rounded-lg bg-[#edf2ed] p-1 dark:bg-white/[0.06]">
            <button
              type="button"
              aria-pressed={cropMode === 'fit'}
              onClick={() => setCropMode('fit')}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${cropMode === 'fit' ? 'bg-white text-[#1d604c] shadow-sm dark:bg-white/[0.12] dark:text-[#cde5d3]' : 'text-[#718176] hover:text-[#1d604c] dark:text-white/55 dark:hover:text-white'}`}
            >
              Fit whole photo
            </button>
            <button
              type="button"
              aria-pressed={cropMode === 'crop'}
              onClick={() => setCropMode('crop')}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${cropMode === 'crop' ? 'bg-white text-[#1d604c] shadow-sm dark:bg-white/[0.12] dark:text-[#cde5d3]' : 'text-[#718176] hover:text-[#1d604c] dark:text-white/55 dark:hover:text-white'}`}
            >
              Crop to fill
            </button>
          </div>

          <div
            ref={cropViewportRef}
            className="relative h-[320px] w-full overflow-hidden rounded-lg bg-[#152820] sm:h-[410px]"
          >
            {sourceUrl &&
              (cropMode === 'crop' && naturalSize ? (
                <div
                  className="absolute"
                  style={{
                    width: cropImageWidth,
                    height: cropImageHeight,
                    left: (viewportSize.width - cropImageWidth) * (horizontalPosition / 100),
                    top: (viewportSize.height - cropImageHeight) * (verticalPosition / 100),
                  }}
                >
                  <Image
                    src={sourceUrl}
                    alt="Image crop preview"
                    fill
                    unoptimized
                    draggable={false}
                    onLoad={(event) =>
                      setNaturalSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      })
                    }
                    className="select-none"
                  />
                </div>
              ) : (
                <Image
                  src={sourceUrl}
                  alt="Image fit preview"
                  fill
                  unoptimized
                  draggable={false}
                  onLoad={(event) =>
                    setNaturalSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }
                  className="select-none object-contain"
                />
              ))}
            {cropMode === 'crop' && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute inset-y-0 left-1/3 border-l border-white/60" />
                <span className="absolute inset-y-0 left-2/3 border-l border-white/60" />
                <span className="absolute inset-x-0 top-1/3 border-t border-white/60" />
                <span className="absolute inset-x-0 top-2/3 border-t border-white/60" />
                <span className="absolute inset-0 border border-white/70" />
              </div>
            )}
          </div>

          {cropMode === 'crop' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <RangeControl
                label="Zoom"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                displayValue={`${zoom.toFixed(1)}×`}
                onChange={setZoom}
              />
              <RangeControl
                label="Horizontal position"
                value={horizontalPosition}
                min={0}
                max={100}
                step={1}
                displayValue={`${Math.round(horizontalPosition)}%`}
                onChange={setHorizontalPosition}
              />
              <RangeControl
                label="Vertical position"
                value={verticalPosition}
                min={0}
                max={100}
                step={1}
                displayValue={`${Math.round(verticalPosition)}%`}
                onChange={setVerticalPosition}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs font-medium text-[#a43f2d] dark:text-[#ffb7a8]">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-[#edf0ec] px-5 py-3 dark:border-white/10 sm:px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#d8e2d9] px-4 text-sm font-semibold text-[#52675a] transition-colors hover:bg-[#f4f8f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d604c]/30 dark:border-white/15 dark:text-white/75 dark:hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!sourceUrl || !naturalSize}
            onClick={applyImage}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] bg-[#1d604c] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#174c3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9aa58] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Crop className="size-4" aria-hidden="true" />
            {cropMode === 'fit' ? 'Use whole photo' : 'Apply crop'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-[#52675a] dark:text-white/70">
        {label}
        <span className="text-[#879189] dark:text-white/45">{displayValue}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-[#1d604c]"
      />
    </label>
  );
}
