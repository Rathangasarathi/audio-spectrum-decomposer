export default class AudioBufferStore {
  private buffer: Float32Array;

  private writeIndex: number;

  private isFull: boolean;

  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;

    this.buffer =
      new Float32Array(capacity);

    this.writeIndex = 0;

    this.isFull = false;
  }

  addSamples(
    samples: Float32Array
  ): void {
    for (
      let i = 0;
      i < samples.length;
      i++
    ) {
      this.buffer[
        this.writeIndex
      ] = samples[i];

      this.writeIndex =
        (this.writeIndex + 1) %
        this.capacity;

      if (
        this.writeIndex === 0
      ) {
        this.isFull = true;
      }
    }
  }

  getSamples(): Float32Array {
    if (!this.isFull) {
      return this.buffer.slice(
        0,
        this.writeIndex
      );
    }

    const result =
      new Float32Array(
        this.capacity
      );

    const tailLength =
      this.capacity -
      this.writeIndex;

    result.set(
      this.buffer.slice(
        this.writeIndex
      ),
      0
    );

    result.set(
      this.buffer.slice(
        0,
        this.writeIndex
      ),
      tailLength
    );

    return result;
  }

  clear(): void {
    this.buffer.fill(0);

    this.writeIndex = 0;

    this.isFull = false;
  }

  size(): number {
    if (this.isFull) {
      return this.capacity;
    }

    return this.writeIndex;
  }
}