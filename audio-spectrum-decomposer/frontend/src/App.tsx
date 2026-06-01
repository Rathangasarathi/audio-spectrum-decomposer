import { useEffect, useRef, useState } from "react";
import Spectrogram from "./components/Spectrogram";
import type { SpectrogramSelection } from "./types/SpectrogramSelection";
import AudioBufferStore from "./dsp/AudioBufferStore";

function App() {
  const waveformCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const fftCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const audioBufferStoreRef =
    useRef<AudioBufferStore | null>(
      null
    );

  const [fftPeak, setFftPeak] =
    useState(0);

  const [analyser, setAnalyser] =
    useState<AnalyserNode | null>(null);

  const [selection, setSelection] =
    useState<SpectrogramSelection | null>(
      null
    );

  useEffect(() => {
    let animationId: number;

    const setupAudio = async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const audioContext =
        new AudioContext();

      audioBufferStoreRef.current =
        new AudioBufferStore(
          audioContext.sampleRate *
            10
        );

      const source =
        audioContext.createMediaStreamSource(
          stream
        );

      const analyserNode =
        audioContext.createAnalyser();

      analyserNode.fftSize = 2048;
      analyserNode.minDecibels =
        -100;
      analyserNode.maxDecibels =
        -20;
      analyserNode.smoothingTimeConstant =
        0.8;

      source.connect(
        analyserNode
      );

      const processor =
        audioContext.createScriptProcessor(
          4096,
          1,
          1
        );

      source.connect(
        processor
      );

      processor.connect(
        audioContext.destination
      );

      processor.onaudioprocess =
        (event) => {
          const input =
            event.inputBuffer.getChannelData(
              0
            );

          audioBufferStoreRef.current?.addSamples(
            new Float32Array(
              input
            )
          );
        };

      setAnalyser(
        analyserNode
      );

      const waveformBuffer =
        new Uint8Array(
          analyserNode.frequencyBinCount
        );

      const fftBuffer =
        new Uint8Array(
          analyserNode.frequencyBinCount
        );

      const waveformCanvas =
        waveformCanvasRef.current;

      const fftCanvas =
        fftCanvasRef.current;

      if (
        !waveformCanvas ||
        !fftCanvas
      )
        return;

      const waveCtx =
        waveformCanvas.getContext(
          "2d"
        );

      const fftCtx =
        fftCanvas.getContext(
          "2d"
        );

      if (
        !waveCtx ||
        !fftCtx
      )
        return;

      const draw = () => {
        analyserNode.getByteTimeDomainData(
          waveformBuffer
        );

        analyserNode.getByteFrequencyData(
          fftBuffer
        );

        waveCtx.clearRect(
          0,
          0,
          waveformCanvas.width,
          waveformCanvas.height
        );

        waveCtx.beginPath();

        let x = 0;

        const sliceWidth =
          waveformCanvas.width /
          waveformBuffer.length;

        for (
          let i = 0;
          i < waveformBuffer.length;
          i++
        ) {
          const v =
            waveformBuffer[i] /
            128.0;

          const y =
            (v *
              waveformCanvas.height) /
            2;

          if (i === 0)
            waveCtx.moveTo(
              x,
              y
            );
          else
            waveCtx.lineTo(
              x,
              y
            );

          x += sliceWidth;
        }

        waveCtx.strokeStyle =
          "#00ff88";

        waveCtx.lineWidth = 2;

        waveCtx.stroke();

        fftCtx.clearRect(
          0,
          0,
          fftCanvas.width,
          fftCanvas.height
        );

        const barWidth =
          fftCanvas.width /
          fftBuffer.length;

        let peak = 0;

        for (
          let i = 0;
          i < fftBuffer.length;
          i++
        ) {
          const value =
            fftBuffer[i];

          if (
            value > peak
          )
            peak = value;

          const barHeight =
            (value / 255) *
            fftCanvas.height;

          fftCtx.fillStyle =
            "#00aaff";

          fftCtx.fillRect(
            i *
              barWidth,
            fftCanvas.height -
              barHeight,
            barWidth,
            barHeight
          );
        }

        setFftPeak(peak);

        animationId =
          requestAnimationFrame(
            draw
          );
      };

      draw();
    };

    setupAudio();

    return () =>
      cancelAnimationFrame(
        animationId
      );
  }, []);

  return (
    <div
      style={{
        background:
          "#0f172a",
        minHeight:
          "100vh",
        color: "white",
        padding:
          "20px",
      }}
    >
      <h1>
        Audio Spectrum Decomposer
      </h1>

      <h2>Waveform</h2>

      <canvas
        ref={
          waveformCanvasRef
        }
        width={1200}
        height={250}
        style={{
          border:
            "1px solid #333",
          background:
            "#111827",
        }}
      />

      <h2
        style={{
          marginTop:
            "30px",
        }}
      >
        FFT Spectrum
      </h2>

      <canvas
        ref={fftCanvasRef}
        width={1200}
        height={300}
        style={{
          border:
            "1px solid #333",
          background:
            "#111827",
        }}
      />

      <p>
        Peak Magnitude:
        {" "}
        {fftPeak}
      </p>

      <h2
        style={{
          marginTop:
            "30px",
        }}
      >
        Spectrogram
      </h2>

      {analyser && (
        <Spectrogram
          analyser={analyser}
          selection={selection}
          onSelectionChange={
            setSelection
          }
        />
      )}

      {selection && (
        <div
          style={{
            marginTop:
              "20px",
            padding:
              "10px",
            border:
              "1px solid #444",
          }}
        >
          <h3>
            Selected Region
          </h3>

          <p>
            Frames:
            {" "}
            {selection.startFrame}
            {" → "}
            {selection.endFrame}
          </p>

          <p>
            Frequency:
            {" "}
            {selection.minFrequency.toFixed(
              0
            )}
            {" Hz → "}
            {selection.maxFrequency.toFixed(
              0
            )}
            {" Hz"}
          </p>

          <p>
            PCM Samples Stored:
            {" "}
            {
              audioBufferStoreRef.current?.size() ??
              0
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default App;