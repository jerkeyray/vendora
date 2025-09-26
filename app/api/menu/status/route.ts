import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) return NextResponse.json({ hasMenu: false });

    const store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) return NextResponse.json({ hasMenu: false });

    const menuCount = await prisma.menu.count({ where: { storeId: store.id } });
    return NextResponse.json({ hasMenu: menuCount > 0 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch menu status" }, { status: 500 });
  }
}


