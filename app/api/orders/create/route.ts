import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Type definitions
interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
}

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
}

export async function POST(request: Request) {
  try {
    const { storeId, items, totalAmount, customerPhone, customerName } =
      await request.json();

    if (!storeId || !items || items.length === 0 || !totalAmount) {
      return NextResponse.json(
        {
          error: "Missing required fields: storeId, items, totalAmount",
        },
        { status: 400 }
      );
    }

    // Verify store exists and get vendor info
    const store = await prisma.store.findUnique({
      where: { id: storeId },
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

    // Create customer if phone is provided
    let customerId = null;
    if (customerPhone) {
      let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            phone: customerPhone,
            name: customerName || null,
          },
        });
      } else if (customerName && !customer.name) {
        // Update customer name if provided and not already set
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { name: customerName },
        });
      }

      customerId = customer.id;
    }

    // Verify all menu items exist and are available
    const menuItemIds = items.map((item: OrderItem) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        isAvailable: true,
        menu: {
          storeId: storeId,
        },
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        {
          error:
            "Some menu items are not available or don't belong to this store",
        },
        { status: 400 }
      );
    }

    // Create order
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        storeId,
        customerId,
        totalAmount,
        status: "PENDING_PAYMENT",
        paymentMethod: "UPI",
        orderItems: {
          create: items.map((item: OrderItem) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        order,
        vendor: store.vendor,
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
