"use client";

import { useEffect, useRef } from "react";
import { MUG_WRAP_FLAT, type SafeZone } from "@/lib/products";

export function MugTurntable({
  textureUrl,
  mugPhotoUrl,
  wrapBounds,
}: {
  textureUrl: string | null;
  mugPhotoUrl: string;
  wrapBounds?: SafeZone & { radius?: number };
}) {
  const box = wrapBounds ?? MUG_WRAP_FLAT.wrapBounds;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const mugRef = useRef<HTMLImageElement | null>(null);
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

    const mug = mugRef.current;
    if (mug && mug.width > 2 && mug.height > 2) {
      const scale = Math.min(w / mug.width, h / mug.height);
      const dw = mug.width * scale;
      const dh = mug.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.drawImage(mug, dx, dy, dw, dh);

      const unit = dw / 800;
      const printBox = {
        left: dx + box.left * unit,
        top: dy + box.top * unit,
        width: box.width * unit,
        height: box.height * unit,
        radius: (box.radius ?? 48) * unit,
      };
      drawWrapOnMug(ctx, textureRef.current, printBox, angleRef.current);
    } else {
      drawFallbackMug(ctx, w, h, textureRef.current, angleRef.current);
    }

    ctx.fillStyle = "#8a7b6c";
    ctx.font = "13px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Drag to rotate", w / 2, h - 18);
  }

  useEffect(() => {
    const img = new Image();
    if (/^https?:/i.test(mugPhotoUrl)) img.crossOrigin = "anonymous";
    img.onload = () => {
      mugRef.current = img;
      paint();
    };
    img.onerror = () => {
      mugRef.current = null;
      paint();
    };
    img.src = mugPhotoUrl;
  }, [mugPhotoUrl]);

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

function drawWrapOnMug(
  ctx: CanvasRenderingContext2D,
  texture: HTMLImageElement | null,
  box: SafeZone & { radius?: number },
  angle: number,
) {
  if (!texture) return;
  ctx.save();
  roundedRectPath(ctx, box.left, box.top, box.width, box.height, box.radius ?? 40);
  ctx.clip();
  const slices = Math.max(80, Math.round(box.width));
  for (let i = 0; i < slices; i++) {
    const t = i / slices;
    const nx = t * 2 - 1;
    const cos = Math.sqrt(Math.max(0, 1 - nx * nx));
    if (cos <= 0.02) continue;
    const theta = Math.atan2(nx, cos) + angle;
    const u = ((theta / (Math.PI * 2) + 0.5) % 1 + 1) % 1;
    const x = box.left + t * box.width;
    const sx = u * Math.max(1, texture.width - 1);
    const column = box.width / slices + 0.6;
    ctx.drawImage(texture, sx, 0, 1, texture.height, x, box.top, column, box.height);
    ctx.fillStyle = `rgba(40,28,18,${0.2 * (1 - cos)})`;
    ctx.fillRect(x, box.top, column, box.height);
  }
  ctx.restore();
}

function drawFallbackMug(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  texture: HTMLImageElement | null,
  angle: number,
) {
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

  drawWrapOnMug(
    ctx,
    texture,
    { left: cx - rx, top, width: rx * 2, height: bodyH, radius: 24 },
    angle,
  );
  if (!texture) {
    ctx.fillStyle = "#f7efe6";
    ctx.fillRect(cx - rx, top, rx * 2, bodyH);
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
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
