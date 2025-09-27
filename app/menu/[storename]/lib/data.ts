import { Store, Menu } from "../types";

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/store/get-by-slug?slug=${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.store || null;
  } catch (error) {
    console.error("Error fetching store:", error);
    return null;
  }
}

export async function getMenuByStoreId(storeId: string): Promise<Menu | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/menu/get-by-store?storeId=${storeId}`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.menu || null;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return null;
  }
}
