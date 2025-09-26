import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { generateStoreQRCode } from "@/lib/qr-generator";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Get vendor and store
    const vendor = await prisma.vendor.findUnique({
      where: { email },
      include: {
        store: true,
      },
    });

    if (!vendor || !vendor.store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const store = vendor.store;

    // Generate QR code if it doesn't exist or regenerate if requested
    const regenerate = searchParams.get("regenerate") === "true";

    let qrCodeDataURL = store.qrCode;

    if (!qrCodeDataURL || regenerate) {
      // Generate new QR code
      const baseURL =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (request.headers.get("host")
          ? `${
              request.headers.get("x-forwarded-proto") || "https"
            }://${request.headers.get("host")}`
          : "http://localhost:3000");

      // Ensure store has a slug
      if (!store.slug) {
        const { generateUniqueSlug } = await import("@/lib/slug-generator");
        const existingSlugs = await prisma.store
          .findMany({
            where: {
              slug: { not: null },
              id: { not: store.id },
            },
            select: { slug: true },
          })
          .then(
            (stores) => stores.map((s) => s.slug).filter(Boolean) as string[]
          );

        const slug = generateUniqueSlug(store.name, existingSlugs);

        // Update store with slug
        await prisma.store.update({
          where: { id: store.id },
          data: { slug: slug },
        });

        store.slug = slug;
      }

      qrCodeDataURL = await generateStoreQRCode(store.slug, baseURL);

      // Update store with QR code
      await prisma.store.update({
        where: { id: store.id },
        data: { qrCode: qrCodeDataURL },
      });
    }

    return NextResponse.json({
      qrCode: qrCodeDataURL,
      storeURL: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/menu/${store.slug}`,
      storeName: store.name,
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email = false } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Get vendor and store
    const vendor = await prisma.vendor.findUnique({
      where: { email },
      include: {
        store: true,
      },
    });

    if (!vendor || !vendor.store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const store = vendor.store;

    // Ensure store has a slug
    if (!store.slug) {
      const { generateUniqueSlug } = await import("@/lib/slug-generator");
      const existingSlugs = await prisma.store
        .findMany({
          where: {
            slug: { not: null },
            id: { not: store.id },
          },
          select: { slug: true },
        })
        .then(
          (stores) => stores.map((s) => s.slug).filter(Boolean) as string[]
        );

      const slug = generateUniqueSlug(store.name, existingSlugs);

      // Update store with slug
      await prisma.store.update({
        where: { id: store.id },
        data: { slug: slug },
      });

      store.slug = slug;
    }

    // Generate QR code
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrCodeDataURL = await generateStoreQRCode(store.slug, baseURL);

    // Update store with QR code
    // const updatedStore = await prisma.store.update({
    //   where: { id: store.id },
    //   data: { qrCode: qrCodeDataURL },
    // });

    return NextResponse.json({
      qrCode: qrCodeDataURL,
      storeURL: `${baseURL}/menu/${store.slug}`,
      storeName: store.name,
      message: "QR code generated successfully",
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
