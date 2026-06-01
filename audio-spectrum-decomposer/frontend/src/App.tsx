import { useEffect, useRef, useState } from "react";
import Spectrogram from "./components/Spectrogram";

function App() {
  const waveformCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const fftCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const [fftPeak, setFftPeak] =
    useState(0);

  const [analyser, setAnalyser] =
    useState<AnalyserNode | null>(null);

  useEffect(() => {
    let animationId: number;

    const setupAudio = async () => {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const audioContext =
        new AudioContext();

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

        //--------------------------------
        // WAVEFORM
        //--------------------------------

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

        //--------------------------------
        // FFT
        //--------------------------------

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
        Audio Spectrum
        Decomposer
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
          analyser={
            analyser
          }
        />
      )}
    </div>
  );
}

export default App;