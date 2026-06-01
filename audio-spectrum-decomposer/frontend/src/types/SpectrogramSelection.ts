export interface SpectrogramSelection {
  startX: number;
  endX: number;

  startY: number;
  endY: number;

  startFrame: number;
  endFrame: number;

  minFrequency: number;
  maxFrequency: number;
}