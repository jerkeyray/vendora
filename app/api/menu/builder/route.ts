import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

type BuilderItem = {
  name: string;
  description?: string;
  price: number;
};

type BuilderSection = {
  name: string;
  description?: string;
  items: BuilderItem[];
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, sections } = body as { email?: string; sections?: BuilderSection[] };

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: "No sections provided" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // Ensure store exists
    let store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) {
      store = await prisma.store.create({ data: { vendorId: vendor.id, name: `${vendor.name}'s Store` } });
    }

    // Ensure a menu exists (create if missing)
    let menu = await prisma.menu.findFirst({ where: { storeId: store.id } });
    if (!menu) {
      menu = await prisma.menu.create({ data: { storeId: store.id, name: "Main Menu" } });
    }

    // Create categories (sections) and items
    for (const section of sections) {
      if (!section?.name || !Array.isArray(section.items)) continue;
      const category = await prisma.category.create({
        data: {
          name: section.name,
          description: section.description || null,
          menuId: menu.id,
        },
      });

      for (const item of section.items) {
        if (!item?.name || typeof item.price !== "number") continue;
        await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description || null,
            price: item.price as unknown as any,
            menuId: menu.id,
            categoryId: category.id,
            isAvailable: true,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to build menu" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, sections } = body as { email?: string; sections?: BuilderSection[] };

    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
    if (!Array.isArray(sections)) return NextResponse.json({ error: "No sections provided" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    const store = await prisma.store.findUnique({ where: { vendorId: vendor.id } });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const menu = await prisma.menu.findFirst({ where: { storeId: store.id } });
    if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

    // Wipe existing structure (items then categories), then recreate
    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    await prisma.category.deleteMany({ where: { menuId: menu.id } });

    for (const section of sections) {
      if (!section?.name) continue;
      const category = await prisma.category.create({
        data: { name: section.name, description: null, menuId: menu.id },
      });
      for (const item of section.items || []) {
        if (!item?.name || typeof item.price !== "number") continue;
        await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description || null,
            price: item.price as unknown as any,
            menuId: menu.id,
            categoryId: category.id,
            isAvailable: true,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}


