// Helper to convert buffer to base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert base64 to buffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generates a random key and IV, encrypts the message
export const encryptMessage = async (plaintext: string): Promise<{ encrypted: string; key: string; iv: string }> => {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM

  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(plaintext);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedMessage
  );

  const exportedKey = await window.crypto.subtle.exportKey('raw', key);

  return {
    encrypted: bufferToBase64(encryptedContent),
    key: bufferToBase64(exportedKey),
    iv: bufferToBase64(iv),
  };
};

// Decrypts the message using the provided key and IV
export const decryptMessage = async (encryptedB64: string, keyB64: string, ivB64: string): Promise<string> => {
  const keyBuffer = base64ToBuffer(keyB64);
  const ivBuffer = base64ToBuffer(ivB64);
  const encryptedBuffer = base64ToBuffer(encryptedB64);

  const key = await window.crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, true, ['decrypt']);

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
};