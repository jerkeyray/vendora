import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    ...options,
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export function generateStoreURL(storeSlug: string, baseURL?: string): string {
  const base =
    baseURL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://vendora.app");
  return `${base}/menu/${storeSlug}`;
}

export async function generateStoreQRCode(
  storeSlug: string,
  baseURL?: string,
  options?: QRCodeOptions
): Promise<string> {
  const storeURL = generateStoreURL(storeSlug, baseURL);
  return generateQRCode(storeURL, options);
}
