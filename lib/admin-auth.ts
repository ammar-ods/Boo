const COOKIE = "boo_admin_session";

function secret() {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "change-me-in-env"
  );
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Buffer.from(sig).toString("hex");
}

export function adminCookieName() {
  return COOKIE;
}

export async function createAdminSessionToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `ok.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function isValidAdminSession(token?: string | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [flag, exp, sig] = parts;
  const payload = `${flag}.${exp}`;
  const expected = await hmac(payload);
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (mismatch !== 0 || flag !== "ok") return false;
  return Number(exp) > Date.now();
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "boo-studio";
  return password === expected;
}
