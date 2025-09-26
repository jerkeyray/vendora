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
    const { name, email, phone, upiId } = body ?? {};

    if (!name || !email || !upiId) {
      return NextResponse.json(
        { error: "name, email and upiId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.vendor.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ vendor: existing }, { status: 200 });
    }

    const vendor = await prisma.vendor.create({
      data: { name, email, phone: phone ?? null, upiId },
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}


