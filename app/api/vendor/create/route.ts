import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({ where: { email } });

    return NextResponse.json({ exists: !!vendor, vendor: vendor ?? null });
  } catch (error) {
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
    let store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) {
      store = await prisma.store.create({ data: { vendorId: vendor.id, name: storeName, address: address ?? null } });
    } else if (storeName || address) {
      store = await prisma.store.update({ where: { id: store.id }, data: { name: storeName ?? store.name, address: address ?? store.address } });
    }

    return NextResponse.json({ vendor, store }, { status: existing ? 200 : 201 });
  } catch (_) {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}


