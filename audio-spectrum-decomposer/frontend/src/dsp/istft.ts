import type {
  STFTResult,
} from "./stft";

export function computeISTFT(
  stft: STFTResult,
  frameSize = 1024,
  hopSize = 512
): Float32Array {
  const outputLength =
    (stft.frames.length - 1) *
      hopSize +
    frameSize;

  const output =
    new Float32Array(
      outputLength
    );

  const window =
    new Float32Array(
      frameSize
    );

  for (
    let n = 0;
    n < frameSize;
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
            (frameSize - 1)
        )
      );
  }

  stft.frames.forEach(
    (frame, frameIndex) => {
      const timeDomain =
        inverseDFT(
          frame.real,
          frame.imag
        );

      const start =
        frameIndex *
        hopSize;

      for (
        let i = 0;
        i < frameSize;
        i++
      ) {
        output[
          start + i
        ] +=
          timeDomain[i] *
          window[i];
      }
    }
  );

  return output;
}

function inverseDFT(
  real: Float32Array,
  imag: Float32Array
): Float32Array {
  const N =
    real.length;

  const output =
    new Float32Array(N);

  for (
    let n = 0;
    n < N;
    n++
  ) {
    let sum = 0;

    for (
      let k = 0;
      k < N;
      k++
    ) {
      const angle =
        (2 *
          Math.PI *
          k *
          n) /
        N;

      sum +=
        real[k] *
          Math.cos(
            angle
          ) -
        imag[k] *
          Math.sin(
            angle
          );
    }

    output[n] =
      sum / N;
  }

  return output;
}