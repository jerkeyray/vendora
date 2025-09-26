import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { generateUniqueSlug } from "@/lib/slug-generator";
import { generateStoreQRCode } from "@/lib/qr-generator";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Find stores without slugs
    const storesWithoutSlugs = await prisma.store.findMany({
      where: {
        OR: [{ slug: null }, { slug: "" }],
      },
    });

    if (storesWithoutSlugs.length === 0) {
      return NextResponse.json({
        message: "All stores already have slugs",
        updated: 0,
      });
    }

    // Get all existing slugs
    const existingSlugs = await prisma.store
      .findMany({
        where: {
          AND: [{ slug: { not: null } }, { slug: { not: "" } }],
        },
        select: { slug: true },
      })
      .then((stores) => stores.map((s) => s.slug).filter(Boolean) as string[]);

    let updated = 0;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Update each store
    for (const store of storesWithoutSlugs) {
      try {
        // Generate unique slug
        const slug = generateUniqueSlug(store.name, existingSlugs);
        existingSlugs.push(slug); // Add to existing slugs to avoid duplicates

        // Generate QR code with new slug
        const qrCode = await generateStoreQRCode(slug, baseURL);

        // Update store
        await prisma.store.update({
          where: { id: store.id },
          data: {
            slug: slug,
            qrCode: qrCode,
          },
        });

        updated++;
        console.log(`Updated store "${store.name}" with slug "${slug}"`);
      } catch (error) {
        console.error(`Failed to update store ${store.id}:`, error);
      }
    }

    return NextResponse.json({
      message: `Successfully updated ${updated} stores with slugs`,
      updated,
      total: storesWithoutSlugs.length,
    });
  } catch (error) {
    console.error("Failed to populate slugs:", error);
    return NextResponse.json(
      { error: "Failed to populate slugs" },
      { status: 500 }
    );
  }
}
