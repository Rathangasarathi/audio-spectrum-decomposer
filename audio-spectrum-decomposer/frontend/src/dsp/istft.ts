export interface ISTFTOptions {
  windowSize?: number;
  hopSize?: number;
  window?: "hann" | "hamming" | "blackman";
}

export function istft(
  magnitudes: number[][],
  phases: number[][],
  options: ISTFTOptions = {}
): Float32Array {
  const windowSize = options.windowSize || 2048;
  const hopSize = options.hopSize || windowSize / 4;
  const windowType = options.window || "hann";

  if (magnitudes.length !== phases.length) {
    throw new Error("Magnitudes and phases must have same number of frames");
  }

  const numFrames = magnitudes.length;
  const outputLength = (numFrames - 1) * hopSize + windowSize;
  const output = new Float32Array(outputLength);

  const window = createWindow(windowSize, windowType);

  for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
    const magnitude = magnitudes[frameIdx];
    const phase = phases[frameIdx];
    const frame = ifft(magnitude, phase, windowSize);

    const offset = frameIdx * hopSize;
    for (let i = 0; i < windowSize; i++) {
      if (offset + i < outputLength) {
        output[offset + i] += (frame[i] * window[i]) / hopSize;
      }
    }
  }

  return output;
}

function createWindow(size: number, type: "hann" | "hamming" | "blackman"): Float32Array {
  const window = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    switch (type) {
      case "hann":
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
        break;
      case "hamming":
        window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (size - 1));
        break;
      case "blackman":
        window[i] =
          0.42 -
          0.5 * Math.cos((2 * Math.PI * i) / (size - 1)) +
          0.08 * Math.cos((4 * Math.PI * i) / (size - 1));
        break;
    }
  }

  return window;
}

function ifft(magnitude: number[], phase: number[], size: number): Float32Array {
  const frame = new Float32Array(size);

  for (let t = 0; t < size; t++) {
    let real = 0;
    let imag = 0;

    for (let k = 0; k < magnitude.length; k++) {
      const angle = (2 * Math.PI * k * t) / size;
      real += magnitude[k] * Math.cos(phase[k] + angle);
      imag += magnitude[k] * Math.sin(phase[k] + angle);
    }

    frame[t] = real / magnitude.length;
  }

  return frame;
}
