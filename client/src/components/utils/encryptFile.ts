// utils/encryptFile.ts

export async function encryptFile(file: File): Promise<{ encryptedBlob: Blob, key: string }> {
  const fileBuffer = await file.arrayBuffer();

  const key = crypto.getRandomValues(new Uint8Array(32)); // 256-bit AES key
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    fileBuffer
  );

  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);

  return {
    encryptedBlob: new Blob([combined], { type: "application/octet-stream" }),
    key: btoa(String.fromCharCode(...key)) // Base64 encode the key
  };
}
