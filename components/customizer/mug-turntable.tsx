"use client";

import { useEffect, useRef } from "react";

export function MugTurntable({ textureUrl }: { textureUrl: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; angle: number } | null>(null);

  function paint() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#efe8de";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.46;
    const cy = h * 0.52;
    const rx = w * 0.22;
    const ry = h * 0.08;
    const bodyH = h * 0.42;
    const top = cy - bodyH / 2;

    ctx.save();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(cx + rx + 18, cy, 28, bodyH * 0.28, 0, -0.7, 0.7);
    ctx.stroke();
    ctx.restore();

    const texture = textureRef.current;
    const slices = Math.max(80, Math.round(rx * 2));
    for (let i = 0; i < slices; i++) {
      const t = i / slices;
      const nx = t * 2 - 1;
      const cos = Math.sqrt(Math.max(0, 1 - nx * nx));
      if (cos <= 0.02) continue;
      const world = Math.atan2(nx, cos) + angleRef.current;
      const u = ((world / (Math.PI * 2) + 0.5) % 1 + 1) % 1;
      const x = cx + nx * rx;
      const column = Math.max(1.2, (rx * 2) / slices + 0.6);
      const shade = 0.22 * (1 - cos);
      if (texture) {
        const sx = u * (texture.width - 1);
        ctx.drawImage(texture, sx, 0, 1, texture.height, x - column / 2, top, column, bodyH);
      } else {
        ctx.fillStyle = "#f7efe6";
        ctx.fillRect(x - column / 2, top, column, bodyH);
      }
      ctx.fillStyle = `rgba(40,28,18,${shade})`;
      ctx.fillRect(x - column / 2, top, column, bodyH);
    }

    ctx.beginPath();
    ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fff8f0";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, top + 4, rx * 0.72, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#c9783a";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, top + bodyH, rx, ry * 0.85, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.stroke();

    ctx.fillStyle = "#8a7b6c";
    ctx.font = "13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Drag to rotate", w / 2, h - 18);
  }

  useEffect(() => {
    if (!textureUrl) {
      textureRef.current = null;
      paint();
      return;
    }
    const img = new Image();
    img.onload = () => {
      textureRef.current = img;
      paint();
    };
    img.src = textureUrl;
  }, [textureUrl]);

  useEffect(() => {
    paint();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      dragRef.current = { x: event.clientX, angle: angleRef.current };
    };
    const move = (event: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = event.clientX - dragRef.current.x;
      angleRef.current = dragRef.current.angle + dx / 90;
      paint();
    };
    const up = () => {
      dragRef.current = null;
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  function spin(delta: number) {
    angleRef.current += delta;
    paint();
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-[#efe8de] ring-1 ring-foreground/10">
      <canvas ref={canvasRef} width={520} height={520} className="w-full cursor-grab touch-none active:cursor-grabbing" />
      <div className="flex justify-center gap-2 pb-3">
        <button
          type="button"
          onClick={() => spin(-0.7)}
          className="rounded-full bg-white px-3 py-1 font-heading text-sm ring-1 ring-foreground/10"
        >
          ↺ Spin
        </button>
        <button
          type="button"
          onClick={() => spin(0.7)}
          className="rounded-full bg-white px-3 py-1 font-heading text-sm ring-1 ring-foreground/10"
        >
          Spin ↻
        </button>
      </div>
    </div>
  );
}
