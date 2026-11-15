export function parseHexColor(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw || raw.startsWith("var(")) return null;
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

export function darkenHex(value: string, amount = 0.38) {
  const rgb = parseHexColor(value);
  if (!rgb) return "#04101c";
  const mix = (channel: number) => Math.max(0, Math.round(channel * (1 - amount)));
  return `#${[mix(rgb.r), mix(rgb.g), mix(rgb.b)].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function isLightColor(value?: string | null) {
  const rgb = parseHexColor(value);
  if (!rgb) return false;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 150;
}
