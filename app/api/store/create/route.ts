import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

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

    const store = await prisma.store.create({
      data: { vendorId: vendor.id, name, address: address || null },
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
