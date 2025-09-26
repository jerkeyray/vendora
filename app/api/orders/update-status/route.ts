import { NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const { orderNumber, status } = await request.json();

    if (!orderNumber || !status) {
      return NextResponse.json(
        { error: "Missing required fields: orderNumber, status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(OrderStatus);

    if (!validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find and update the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        store: {
          select: {
            name: true,
            vendor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order with appropriate timestamp
    const updateData: {
      status: OrderStatus;
      paymentCompletedAt?: Date;
      confirmedAt?: Date;
      rejectedAt?: Date;
      completedAt?: Date;
    } = { status: status as OrderStatus };

    switch (status) {
      case "PAYMENT_COMPLETED":
        updateData.paymentCompletedAt = new Date();
        break;
      case "CONFIRMED":
        updateData.confirmedAt = new Date();
        break;
      case "REJECTED":
        updateData.rejectedAt = new Date();
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        break;
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: updateData,
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
    });

    return NextResponse.json({
      order: updatedOrder,
      message: `Order ${status.toLowerCase().replace("_", " ")} successfully`,
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
