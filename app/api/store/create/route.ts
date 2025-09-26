import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { generateStoreQRCode } from "@/lib/qr-generator";
import { generateUniqueSlug } from "@/lib/slug-generator";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, address } = await request.json();
    if (!email || !name)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor)
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // if store exists, return it
    const existing = await prisma.store.findUnique({
      where: { vendorId: vendor.id },
    });
    if (existing)
      return NextResponse.json({ store: existing }, { status: 200 });

    // Generate unique slug for the store
    const existingSlugs = await prisma.store
      .findMany({
        where: { slug: { not: null } },
        select: { slug: true },
      })
      .then((stores) => stores.map((s) => s.slug).filter(Boolean) as string[]);

    const slug = generateUniqueSlug(name, existingSlugs);

    // Generate QR code for the store
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrCode = await generateStoreQRCode(slug, baseURL);

    const store = await prisma.store.create({
      data: {
        vendorId: vendor.id,
        name,
        slug: slug,
        address: address || null,
        qrCode: qrCode,
      },
    });
    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Failed to create store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
