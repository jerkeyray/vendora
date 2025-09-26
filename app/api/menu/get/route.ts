import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor)
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const store = await prisma.store.findUnique({
      where: { vendorId: vendor.id },
    });
    if (!store) return NextResponse.json({ menu: null });

    const menu = await prisma.menu.findFirst({
      where: { storeId: store.id },
      include: {
        categories: {
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
