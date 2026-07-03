import { useMemo, useState } from "react";

export interface CropModeProps {
  cropMode: boolean;
  onCropModeChange: (active: boolean) => void;
}

export function useCropModeProps(): CropModeProps {
  const [cropMode, setCropMode] = useState(false);
  return useMemo(
    () => ({
      cropMode,
      onCropModeChange: setCropMode,
    }),
    [cropMode],
  );
}
