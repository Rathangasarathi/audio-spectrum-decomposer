import { ISTFTOptions, istft } from "./istft";

export interface ReconstructionOptions extends ISTFTOptions {
  applyMask?: boolean;
}

export interface ComplexSpectrum {
  magnitudes: number[][];
  phases: number[][];
}

export function reconstructAudio(
  spectrum: ComplexSpectrum,
  options: ReconstructionOptions = {}
): Float32Array {
  const { applyMask, ...istftOptions } = options;

  // Future mask-aware reconstruction can be handled here.
  return istft(spectrum.magnitudes, spectrum.phases, istftOptions);
}

export function synthesizeSelection(
  magnitudes: number[][],
  phases: number[][],
  selectedBins: number[]
): ComplexSpectrum {
  const maskedMagnitudes = magnitudes.map((frame) =>
    frame.map((value, binIndex) =>
      selectedBins.includes(binIndex) ? value : 0
    )
  );

  return {
    magnitudes: maskedMagnitudes,
    phases,
  };
}
