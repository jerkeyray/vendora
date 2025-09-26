import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

// Use a global PrismaClient instance to avoid connection issues
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorEmail = searchParams.get("email");

    if (!vendorEmail) {
      return NextResponse.json(
        { error: "Vendor email is required" },
        { status: 400 }
      );
    }

    // Get vendor and their store
    const vendor = await prisma.vendor.findUnique({
      where: { email: vendorEmail },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    if (!vendor.store) {
      return NextResponse.json({
        orders: [],
        message: "No store found for vendor",
      });
    }

    // Get all orders for vendor's store
    const orders = await prisma.order.findMany({
      where: {
        storeId: vendor.store.id,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
                isVeg: true,
              },
            },
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group orders by status for better organization
    const pendingOrders = orders.filter(
      (order) => order.status === "PAYMENT_COMPLETED"
    );

    const confirmedOrders = orders.filter(
      (order) => order.status === "CONFIRMED"
    );

    const completedOrders = orders.filter((order) =>
      ["COMPLETED", "REJECTED", "CANCELLED"].includes(order.status)
    );

    return NextResponse.json({
      orders: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        completed: completedOrders,
        all: orders,
      },
      vendor: {
        name: vendor.name,
        store: vendor.store,
      },
    });
  } catch (error) {
    console.error("Failed to fetch vendor orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
