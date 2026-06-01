import type {
  STFTResult,
} from "./stft";

export function applyFrequencyMask(
  stft: STFTResult,
  startFrame: number,
  endFrame: number,
  minBin: number,
  maxBin: number
): STFTResult {
  const maskedFrames =
    stft.frames.map(
      (frame, frameIndex) => {
        const real =
          new Float32Array(
            frame.real
          );

        const imag =
          new Float32Array(
            frame.imag
          );

        const magnitude =
          new Float32Array(
            frame.magnitude
          );

        for (
          let bin = 0;
          bin <
          magnitude.length;
          bin++
        ) {
          const keep =
            frameIndex >=
              startFrame &&
            frameIndex <=
              endFrame &&
            bin >= minBin &&
            bin <= maxBin;

          if (!keep) {
            real[bin] = 0;
            imag[bin] = 0;
            magnitude[bin] = 0;
          }
        }

        return {
          real,
          imag,
          magnitude,
        };
      }
    );

  return {
    frames:
      maskedFrames,
  };
}