import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const vendor = await prisma.vendor.findUnique({
      where: { email },
      include: { store: true },
    });

    if (!vendor) return NextResponse.json({ vendor: null }, { status: 200 });
    return NextResponse.json({ vendor });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch vendor" }, { status: 500 });
  }
}


