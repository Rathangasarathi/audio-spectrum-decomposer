import { useEffect, useRef } from "react";

interface SpectrogramProps {
  analyser: AnalyserNode;
}

export default function Spectrogram({
  analyser,
}: SpectrogramProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const buffer = new Float32Array(
      analyser.frequencyBinCount
    );

    let animationId: number;

    const draw = () => {
      analyser.getFloatFrequencyData(
        buffer
      );

      // Scroll left
      ctx.drawImage(canvas, -1, 0);

      for (
        let y = 0;
        y < canvas.height;
        y++
      ) {
        const index = Math.floor(
          (y / canvas.height) *
            buffer.length
        );

        const db =
          buffer[
            buffer.length -
              1 -
              index
          ];

        const normalized =
          Math.max(
            0,
            Math.min(
              1,
              (db + 100) / 80
            )
          );

        const intensity =
          Math.floor(
            normalized * 255
          );

        ctx.fillStyle = `rgb(
          ${intensity},
          0,
          ${255 - intensity}
        )`;

        ctx.fillRect(
          canvas.width - 1,
          y,
          1,
          1
        );
      }

      animationId =
        requestAnimationFrame(draw);
    };

    draw();

    return () =>
      cancelAnimationFrame(
        animationId
      );
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={400}
      style={{
        border: "1px solid #333",
        background: "#000",
      }}
    />
  );
}