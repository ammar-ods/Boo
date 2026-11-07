export async function uploadOrderAsset(file: File) {
  const data = new FormData();
  data.set("file", file);
  const response = await fetch("/api/order-assets", { method: "POST", body: data });
  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || "Could not upload design file");
  }
  return payload.url;
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(blob);
  });
}

export async function storeOrderAsset(file: File) {
  try {
    return await uploadOrderAsset(file);
  } catch {
    return blobToDataUrl(file);
  }
}
