import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, description } = await request.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // Ensure store exists for vendor
    let store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) {
      store = await prisma.store.create({ data: { vendorId: vendor.id, name: `${vendor.name}'s Store` } });
    }

    // If already has menu, return ok
    const existing = await prisma.menu.findFirst({ where: { storeId: store.id } });
    if (existing) return NextResponse.json({ menu: existing }, { status: 200 });

    const menu = await prisma.menu.create({ data: { storeId: store.id, name: name || "Main Menu" } });
    if (description) {
      // placeholder: you could store description in a separate table/field later
    }
    return NextResponse.json({ menu }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}


