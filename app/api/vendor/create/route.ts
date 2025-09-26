import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { generateStoreQRCode } from "@/lib/qr-generator";
import { generateUniqueSlug } from "@/lib/slug-generator";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { email } });

    return NextResponse.json({ exists: !!vendor, vendor: vendor ?? null });
  } catch (error) {
    console.error("Failed to fetch vendor status:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, upiId, storeName, address } = body ?? {};

    if (!email || !upiId || !storeName) {
      return NextResponse.json(
        { error: "email, upiId and storeName are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.vendor.findUnique({ where: { email } });
    let vendor = existing;
    if (!vendor) {
      // Create minimal vendor using email as unique id; name can be set later
      vendor = await prisma.vendor.create({
        data: { name: email.split("@")[0], email, phone: phone ?? null, upiId },
      });
    } else {
      // Update phone/upi if provided
      vendor = await prisma.vendor.update({
        where: { email },
        data: { phone: phone ?? vendor.phone, upiId: upiId ?? vendor.upiId },
      });
    }

    // Ensure a store exists/created for this vendor
    let store = await prisma.store.findUnique({
      where: { vendorId: vendor.id },
    });
    if (!store) {
      // Generate unique slug for the store
      const existingSlugs = await prisma.store
        .findMany({
          where: { slug: { not: null } },
          select: { slug: true },
        })
        .then(
          (stores) => stores.map((s) => s.slug).filter(Boolean) as string[]
        );

      const slug = generateUniqueSlug(storeName, existingSlugs);

      // Generate QR code for new store
      const baseURL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const qrCode = await generateStoreQRCode(slug, baseURL);

      store = await prisma.store.create({
        data: {
          vendorId: vendor.id,
          name: storeName,
          slug: slug,
          address: address ?? null,
          qrCode: qrCode,
        },
      });
    } else if (storeName || address) {
      // If store name changed, regenerate slug and QR code
      const shouldRegenerateSlug = storeName && storeName !== store.name;
      let slug = store.slug;
      let qrCode = store.qrCode;

      if (shouldRegenerateSlug) {
        // Generate new unique slug
        const existingSlugs = await prisma.store
          .findMany({
            where: {
              slug: { not: null },
              id: { not: store.id }, // Exclude current store
            },
            select: { slug: true },
          })
          .then(
            (stores) => stores.map((s) => s.slug).filter(Boolean) as string[]
          );

        slug = generateUniqueSlug(storeName, existingSlugs);

        // Regenerate QR code with new slug
        const baseURL =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        qrCode = await generateStoreQRCode(slug, baseURL);
      } else if (!store.slug) {
        // Generate slug for existing store without one
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

        slug = generateUniqueSlug(store.name, existingSlugs);

        // Generate QR code with slug
        const baseURL =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        qrCode = await generateStoreQRCode(slug, baseURL);
      }

      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          name: storeName ?? store.name,
          slug: slug,
          address: address ?? store.address,
          qrCode: qrCode,
        },
      });
    }

    return NextResponse.json(
      { vendor, store },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error("Failed to create vendor:", error);
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
