import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Missing store name" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        isActive: true,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            upiId: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Failed to fetch store:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}
