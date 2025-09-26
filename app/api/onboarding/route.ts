import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { generateStoreQRCode } from "@/lib/qr-generator";
import { generateUniqueSlug } from "@/lib/slug-generator";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, vendor, store } = body;

    // Validate required fields
    if (!email || !vendor?.name || !vendor?.upiId || !store?.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(vendor.upiId)) {
      return NextResponse.json(
        { error: "Invalid UPI ID format" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (vendor.phone && !/^\d{10}$/.test(vendor.phone)) {
      return NextResponse.json(
        { error: "Phone number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email },
      include: { store: true },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "Vendor already exists" },
        { status: 409 }
      );
    }

    // Create vendor, store, and default menu in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vendor
      const newVendor = await tx.vendor.create({
        data: {
          email,
          name: vendor.name,
          phone: vendor.phone || null,
          upiId: vendor.upiId,
        },
      });

      // Generate unique slug for the store
      const existingSlugs = await tx.store
        .findMany({
          where: { slug: { not: null } },
          select: { slug: true },
        })
        .then(
          (stores) => stores.map((s) => s.slug).filter(Boolean) as string[]
        );

      const slug = generateUniqueSlug(store.name, existingSlugs);

      // Generate QR code for the store
      const baseURL =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const qrCode = await generateStoreQRCode(slug, baseURL);

      // Create store
      const newStore = await tx.store.create({
        data: {
          name: store.name,
          slug: slug,
          description: store.description || null,
          address: store.address || null,
          vendorId: newVendor.id,
          qrCode: qrCode,
        },
      });

      // Create default menu
      const defaultMenu = await tx.menu.create({
        data: {
          name: "Main Menu",
          storeId: newStore.id,
        },
      });

      return {
        vendor: newVendor,
        store: newStore,
        menu: defaultMenu,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      data: {
        vendorId: result.vendor.id,
        storeId: result.store.id,
        menuId: result.menu.id,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Email or UPI ID already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check onboarding status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { email },
      include: {
        store: {
          include: {
            menus: {
              take: 1,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({
        onboardingComplete: false,
        needsOnboarding: true,
      });
    }

    return NextResponse.json({
      onboardingComplete: true,
      needsOnboarding: false,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        upiId: vendor.upiId,
      },
      store: vendor.store
        ? {
            id: vendor.store.id,
            name: vendor.store.name,
            description: vendor.store.description,
            address: vendor.store.address,
            hasMenu: vendor.store.menus.length > 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Onboarding status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
