export interface MaskingOptions {
  threshold?: number;
  smoothing?: boolean;
  smoothingKernel?: number;
}

export function createMask(
  magnitudes: number[][],
  startBin: number,
  endBin: number,
  options: MaskingOptions = {}
): boolean[][] {
  const threshold = options.threshold ?? 0;
  const shouldSmooth = options.smoothing ?? false;
  const kernel = options.smoothingKernel ?? 3;

  const numFrames = magnitudes.length;
  const mask = Array.from({ length: numFrames }, (_, i) =>
    Array.from({ length: magnitudes[i]?.length ?? 0 }, (_, j) => {
      return j >= startBin && j <= endBin;
    })
  );

  if (shouldSmooth) {
    return smoothMask(mask, kernel);
  }

  return mask;
}

export function applyMask(
  magnitudes: number[][],
  mask: boolean[][]
): number[][] {
  return magnitudes.map((frame, frameIdx) =>
    frame.map((mag, binIdx) => {
      const isMasked = mask[frameIdx]?.[binIdx] ?? false;
      return isMasked ? mag : 0;
    })
  );
}

function smoothMask(mask: boolean[][], kernelSize: number): boolean[][] {
  const halfKernel = Math.floor(kernelSize / 2);
  const smoothed = mask.map((frame) =>
    frame.map((_, binIdx) => {
      let count = 0;
      let sum = 0;

      for (let i = -halfKernel; i <= halfKernel; i++) {
        const neighborIdx = binIdx + i;
        if (neighborIdx >= 0 && neighborIdx < frame.length && frame[neighborIdx]) {
          sum++;
        }
        count++;
      }

      return sum / count > 0.5;
    })
  );

  return smoothed;
}
