import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, sections } = await request.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // Ensure store exists for vendor
    let store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) {
      store = await prisma.store.create({ data: { vendorId: vendor.id, name: `${vendor.name}'s Store` } });
    }

    // Find or create menu
    let menu = await prisma.menu.findFirst({ where: { storeId: store.id } });
    if (menu) {
      // Delete existing categories and items
      await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
      await prisma.category.deleteMany({ where: { menuId: menu.id } });
    } else {
      menu = await prisma.menu.create({ data: { storeId: store.id, name: name || "Main Menu" } });
    }

    // Create categories and items if sections are provided
    if (sections && sections.length > 0) {
      for (const section of sections) {
        const category = await prisma.category.create({
          data: {
            menuId: menu.id,
            name: section.name,
            sortOrder: 0,
          },
        });

        for (const item of section.items) {
          await prisma.menuItem.create({
            data: {
              menuId: menu.id,
              categoryId: category.id,
              name: item.name,
              description: item.description || null,
              price: Number(item.price),
              sortOrder: 0,
            },
          });
        }
      }
    }

    return NextResponse.json({ menu }, { status: 200 });
  } catch (_) {
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}


