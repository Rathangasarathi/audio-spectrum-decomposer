export interface WAVExportOptions {
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
  channels?: number;
}

export function exportToWAV(
  audioData: Float32Array,
  options: WAVExportOptions = {}
): Blob {
  const sampleRate = options.sampleRate || 44100;
  const bitDepth = options.bitDepth || 16;
  const channels = options.channels || 1;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = channels * bytesPerSample;

  const headerSize = 44;
  const dataSize = audioData.length * bytesPerSample;
  const fileSize = headerSize + dataSize - 8;

  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, fileSize, true);
  writeString(view, 8, "WAVE");

  // fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Write audio data
  const offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    const sample = Math.max(-1, Math.min(1, audioData[i]));
    const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

    switch (bitDepth) {
      case 16:
        view.setInt16(offset + i * 2, value, true);
        break;
      case 24:
        write24BitInt(view, offset + i * 3, value);
        break;
      case 32:
        view.setInt32(offset + i * 4, value, true);
        break;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function write24BitInt(view: DataView, offset: number, value: number): void {
  const bytes = new Int32Array([value]);
  view.setUint8(offset, bytes[0] & 0xff);
  view.setUint8(offset + 1, (bytes[0] >> 8) & 0xff);
  view.setUint8(offset + 2, (bytes[0] >> 16) & 0xff);
}

export function downloadWAV(blob: Blob, filename: string = "audio.wav"): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
