
import { useEffect, useRef } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationId: number;

    const setupAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const audioContext = new AudioContext();

      const source =
        audioContext.createMediaStreamSource(stream);

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;

      source.connect(analyser);

      const bufferLength =
        analyser.frequencyBinCount;

      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;

      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const draw = () => {
        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.beginPath();

        const sliceWidth =
          canvas.width / bufferLength;

        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;

          const y =
            (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.stroke();

        animationId =
          requestAnimationFrame(draw);
      };

      draw();
    };

    setupAudio();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>Audio Spectrum Decomposer</h1>

      <canvas
        ref={canvasRef}
        width={1200}
        height={400}
        style={{
          border: "1px solid #333",
          background: "#111827",
        }}
      />
    </div>
  );
}

export default App;