import { useState, useCallback } from 'react';

export interface UseImageEditorProps {
  previewUrl: string | null;
  selectedFile: File | null;
  cropShape?: 'round' | 'square' | 'none';
}

export function useImageEditor({ previewUrl, selectedFile, cropShape = 'none' }: UseImageEditorProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);

  const rotateLeft = useCallback(() => setRotation((r) => r - 90), []);
  const rotateRight = useCallback(() => setRotation((r) => r + 90), []);
  const toggleCropping = useCallback(() => setIsCropping((prev) => !prev), []);
  
  const resetEditor = useCallback(() => {
    setRotation(0);
    setZoom(1);
    setIsCropping(false);
  }, []);

  const getCroppedImage = async (): Promise<File> => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return selectedFile as File;
    if (zoom === 1 && rotation === 0 && !isCropping) return selectedFile as File;

    return new Promise((resolve) => {
      const image = new Image();
      image.src = previewUrl as string;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const canvasSize = 800; // High quality square output
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(selectedFile as File);
          return;
        }

        // If not PNG, fill with white to avoid black background in JPGs
        if (selectedFile.type !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Move to center to apply rotation and scale
        ctx.translate(canvasSize / 2, canvasSize / 2);

        // Apply circular mask if requested
        if (cropShape === 'round' && isCropping) {
          ctx.beginPath();
          ctx.arc(0, 0, canvasSize / 2, 0, Math.PI * 2);
          ctx.clip();
        }

        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Simulate object-fit: contain logic in the canvas
        const scale = canvasSize / Math.max(image.width, image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;

        ctx.drawImage(
          image,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(selectedFile as File);
            return;
          }
          const croppedFile = new File([blob], selectedFile.name, {
            type: selectedFile.type,
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        }, selectedFile.type, 0.95);
      };
      image.onerror = () => {
        resolve(selectedFile as File);
      };
    });
  };

  return {
    rotation,
    setRotation,
    zoom,
    setZoom,
    isCropping,
    setIsCropping,
    rotateLeft,
    rotateRight,
    toggleCropping,
    resetEditor,
    getCroppedImage,
  };
}
