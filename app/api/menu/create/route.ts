import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, menuItems } = await request.json();
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    if (!menuItems || !Array.isArray(menuItems)) {
      return NextResponse.json(
        { error: "Missing or invalid menuItems" },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.findUnique({ where: { email } });
    if (!vendor)
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // Ensure store exists for vendor
    let store = await prisma.store.findUnique({
      where: { vendorId: vendor.id },
    });
    if (!store) {
      store = await prisma.store.create({
        data: { vendorId: vendor.id, name: `${vendor.name}'s Store` },
      });
    }

    // Find or create menu
    let menu = await prisma.menu.findFirst({ where: { storeId: store.id } });
    if (menu) {
      // Delete existing categories and items
      await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
      await prisma.category.deleteMany({ where: { menuId: menu.id } });
    } else {
      menu = await prisma.menu.create({
        data: { storeId: store.id, name: "Main Menu" },
      });
    }

    // Group menu items by category name
    const itemsByCategory = menuItems.reduce(
      (acc, item) => {
        const categoryName = item.categoryName || "Main Menu";
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      },
      {} as Record<
        string,
        Array<{
          name: string;
          description?: string;
          price: number;
          categoryName?: string;
          isVeg?: boolean;
          isAvailable?: boolean;
        }>
      >
    );

    // Create categories and items
    for (const [categoryName, items] of Object.entries(itemsByCategory)) {
      const category = await prisma.category.create({
        data: {
          menuId: menu.id,
          name: categoryName,
          sortOrder: 0,
        },
      });

      for (const item of items as Array<{
        name: string;
        description?: string;
        price: number;
        categoryName?: string;
        isVeg?: boolean;
        isAvailable?: boolean;
      }>) {
        await prisma.menuItem.create({
          data: {
            menuId: menu.id,
            categoryId: category.id,
            name: item.name,
            description: item.description || null,
            price: Number(item.price),
            isVeg: item.isVeg ?? true,
            isAvailable: item.isAvailable ?? true,
            sortOrder: 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, menu }, { status: 200 });
  } catch (error) {
    console.error("Menu creation error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to create menu: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
