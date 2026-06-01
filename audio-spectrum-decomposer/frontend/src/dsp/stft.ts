export interface STFTFrame {
  real: Float32Array;
  imag: Float32Array;
  magnitude: Float32Array;
}

export interface STFTResult {
  frames: STFTFrame[];
}

function hannWindow(
  size: number
): Float32Array {
  const window =
    new Float32Array(size);

  for (
    let n = 0;
    n < size;
    n++
  ) {
    window[n] =
      0.5 *
      (
        1 -
        Math.cos(
          (2 *
            Math.PI *
            n) /
            (size - 1)
        )
      );
  }

  return window;
}

function fft(
  input: Float32Array
) {
  const N = input.length;

  const real =
    new Float32Array(N);

  const imag =
    new Float32Array(N);

  for (
    let k = 0;
    k < N;
    k++
  ) {
    let sumReal = 0;

    let sumImag = 0;

    for (
      let n = 0;
      n < N;
      n++
    ) {
      const angle =
        (-2 *
          Math.PI *
          k *
          n) /
        N;

      sumReal +=
        input[n] *
        Math.cos(angle);

      sumImag +=
        input[n] *
        Math.sin(angle);
    }

    real[k] = sumReal;

    imag[k] = sumImag;
  }

  return {
    real,
    imag,
  };
}

export function computeSTFT(
  samples: Float32Array,
  frameSize = 1024,
  hopSize = 512
): STFTResult {
  const window =
    hannWindow(frameSize);

  const frames:
    STFTFrame[] = [];

  for (
    let start = 0;
    start + frameSize <
    samples.length;
    start += hopSize
  ) {
    const frame =
      new Float32Array(
        frameSize
      );

    for (
      let i = 0;
      i < frameSize;
      i++
    ) {
      frame[i] =
        samples[
          start + i
        ] *
        window[i];
    }

    const {
      real,
      imag,
    } = fft(frame);

    const magnitude =
      new Float32Array(
        frameSize / 2
      );

    for (
      let i = 0;
      i <
      frameSize / 2;
      i++
    ) {
      magnitude[i] =
        Math.sqrt(
          real[i] *
            real[i] +
            imag[i] *
              imag[i]
        );
    }

    frames.push({
      real,
      imag,
      magnitude,
    });
  }

  return {
    frames,
  };
}