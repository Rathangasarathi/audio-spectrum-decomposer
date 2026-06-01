import { useEffect, useRef, useState } from "react";
import type { SpectrogramSelection } from "../types/SpectrogramSelection";

interface SpectrogramProps {
  analyser: AnalyserNode;
  selection: SpectrogramSelection | null;
  onSelectionChange: (
    selection: SpectrogramSelection
  ) => void;
}

export default function Spectrogram({
  analyser,
  selection,
  onSelectionChange,
}: SpectrogramProps) {
  const spectrogramCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const overlayCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const frameCounterRef =
    useRef(0);

  const frameHistoryRef =
    useRef<number[]>([]);

  const spectrogramFramesRef =
    useRef<Float32Array[]>([]);

  const isDraggingRef =
    useRef(false);

  const selectionStartRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  const selectionEndRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  const [cursorInfo, setCursorInfo] =
    useState({
      x: 0,
      y: 0,
      frequency: 0,
    });

  const getFrequencyFromY = (
    y: number,
    canvasHeight: number
  ) => {
    return (
      ((canvasHeight - y) /
        canvasHeight) *
      24000
    );
  };

  useEffect(() => {
    const canvas =
      spectrogramCanvasRef.current;

    const overlay =
      overlayCanvasRef.current;

    if (!canvas || !overlay)
      return;

    const ctx =
      canvas.getContext("2d");

    const overlayCtx =
      overlay.getContext("2d");

    if (!ctx || !overlayCtx)
      return;

    const buffer =
      new Float32Array(
        analyser.frequencyBinCount
      );

    let animationId: number;

    const draw = () => {
      analyser.getFloatFrequencyData(
        buffer
      );

      frameCounterRef.current++;

      frameHistoryRef.current.push(
        frameCounterRef.current
      );

      spectrogramFramesRef.current.push(
        buffer.slice()
      );

      if (
        frameHistoryRef.current.length >
        canvas.width
      ) {
        frameHistoryRef.current.shift();
      }

      if (
        spectrogramFramesRef.current.length >
        canvas.width
      ) {
        spectrogramFramesRef.current.shift();
      }

      ctx.drawImage(
        canvas,
        -1,
        0
      );

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

        ctx.fillStyle =
          `rgb(${intensity},0,${
            255 - intensity
          })`;

        ctx.fillRect(
          canvas.width - 1,
          y,
          1,
          1
        );
      }

      overlayCtx.clearRect(
        0,
        0,
        overlay.width,
        overlay.height
      );

      const start =
        selectionStartRef.current;

      const end =
        selectionEndRef.current;

      if (
        start &&
        end
      ) {
        const x = Math.min(
          start.x,
          end.x
        );

        const y = Math.min(
          start.y,
          end.y
        );

        const width =
          Math.abs(
            end.x - start.x
          );

        const height =
          Math.abs(
            end.y - start.y
          );

        overlayCtx.strokeStyle =
          "#00ff00";

        overlayCtx.lineWidth = 2;

        overlayCtx.strokeRect(
          x,
          y,
          width,
          height
        );

        overlayCtx.fillStyle =
          "rgba(0,255,0,0.15)";

        overlayCtx.fillRect(
          x,
          y,
          width,
          height
        );
      }

      animationId =
        requestAnimationFrame(
          draw
        );
    };

    draw();

    return () =>
      cancelAnimationFrame(
        animationId
      );
  }, [analyser]);

  const getMousePosition = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas =
      overlayCanvasRef.current;

    if (!canvas)
      return null;

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        e.clientX -
        rect.left,
      y:
        e.clientY -
        rect.top,
    };
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const pos =
      getMousePosition(e);

    if (!pos) return;

    isDraggingRef.current =
      true;

    selectionStartRef.current =
      pos;

    selectionEndRef.current =
      pos;
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas =
      overlayCanvasRef.current;

    const pos =
      getMousePosition(e);

    if (
      !canvas ||
      !pos
    )
      return;

    const frequency =
      getFrequencyFromY(
        pos.y,
        canvas.height
      );

    setCursorInfo({
      x: pos.x,
      y: pos.y,
      frequency,
    });

    if (
      isDraggingRef.current
    ) {
      selectionEndRef.current =
        pos;
    }
  };

  const handleMouseUp = () => {
    const canvas =
      overlayCanvasRef.current;

    const start =
      selectionStartRef.current;

    const end =
      selectionEndRef.current;

    if (
      !canvas ||
      !start ||
      !end
    ) {
      isDraggingRef.current =
        false;
      return;
    }

    const startX =
      Math.min(
        start.x,
        end.x
      );

    const endX =
      Math.max(
        start.x,
        end.x
      );

    const startY =
      Math.min(
        start.y,
        end.y
      );

    const endY =
      Math.max(
        start.y,
        end.y
      );

    const startFrame =
      frameHistoryRef.current[
        Math.floor(startX)
      ] ?? 0;

    const endFrame =
      frameHistoryRef.current[
        Math.floor(endX)
      ] ?? 0;

    const maxFrequency =
      getFrequencyFromY(
        startY,
        canvas.height
      );

    const minFrequency =
      getFrequencyFromY(
        endY,
        canvas.height
      );

    onSelectionChange({
      startX,
      endX,
      startY,
      endY,
      startFrame,
      endFrame,
      minFrequency,
      maxFrequency,
    });

    isDraggingRef.current =
      false;
  };

  return (
    <div>
      <div
        style={{
          position:
            "relative",
          width: "1200px",
          height: "400px",
        }}
      >
        <canvas
          ref={
            spectrogramCanvasRef
          }
          width={1200}
          height={400}
          style={{
            position:
              "absolute",
            top: 0,
            left: 0,
            border:
              "1px solid #333",
            background:
              "#000",
          }}
        />

        <canvas
          ref={
            overlayCanvasRef
          }
          width={1200}
          height={400}
          onMouseDown={
            handleMouseDown
          }
          onMouseMove={
            handleMouseMove
          }
          onMouseUp={
            handleMouseUp
          }
          style={{
            position:
              "absolute",
            top: 0,
            left: 0,
            cursor:
              "crosshair",
            background:
              "transparent",
          }}
        />
      </div>

      <div
        style={{
          marginTop:
            "10px",
          color:
            "white",
          fontSize:
            "16px",
        }}
      >
        X:
        {" "}
        {cursorInfo.x.toFixed(
          0
        )}
        {" | "}
        Y:
        {" "}
        {cursorInfo.y.toFixed(
          0
        )}
        {" | "}
        Frequency:
        {" "}
        {cursorInfo.frequency.toFixed(
          0
        )}
        {" Hz"}
      </div>

      {selection && (
        <div
          style={{
            marginTop:
              "10px",
            color:
              "#00ff88",
          }}
        >
          Frames:
          {" "}
          {selection.startFrame}
          {" → "}
          {selection.endFrame}

          <br />

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
        </div>
      )}
    </div>
  );
}