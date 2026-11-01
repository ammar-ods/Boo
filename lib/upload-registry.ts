export const uploadRegistry = new Map<string, File>();

export function rememberFile(id: string, file: File) {
  uploadRegistry.set(id, file);
}

export function forgetFile(id: string) {
  uploadRegistry.delete(id);
}

export function allRememberedFiles() {
  return Array.from(uploadRegistry.values());
}

export function clearRememberedFiles() {
  uploadRegistry.clear();
}
