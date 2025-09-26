"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  User,
  Calendar,
  Hash,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

interface OrderItem {
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    price: number;
    isVeg: boolean;
  };
}

interface Customer {
  name: string | null;
  phone: string | null;
}

interface Store {
  name: string;
  address: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentCompletedAt: string | null;
  confirmedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  orderItems: OrderItem[];
  customer: Customer | null;
  store: Store;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`
        );

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          badge: (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-200"
            >
              Payment Pending
            </Badge>
          ),
          icon: <Clock className="h-5 w-5 text-orange-600" />,
          message: "Waiting for payment confirmation",
          color: "text-orange-600",
        };
      case "PAYMENT_COMPLETED":
        return {
          badge: (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Payment Completed
            </Badge>
          ),
          icon: <CreditCard className="h-5 w-5 text-blue-600" />,
          message: "Payment received, awaiting vendor confirmation",
          color: "text-blue-600",
        };
      case "CONFIRMED":
        return {
          badge: (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200"
            >
              Order Confirmed
            </Badge>
          ),
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          message: "Your order has been confirmed and is being prepared",
          color: "text-green-600",
        };
      case "REJECTED":
        return {
          badge: (
            <Badge variant="outline" className="text-red-600 border-red-200">
              Order Rejected
            </Badge>
          ),
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          message: "Sorry, your order was rejected by the vendor",
          color: "text-red-600",
        };
      case "COMPLETED":
        return {
          badge: (
            <Badge
              variant="outline"
              className="text-purple-600 border-purple-200"
            >
              Order Ready
            </Badge>
          ),
          icon: <Package className="h-5 w-5 text-purple-600" />,
          message: "Your order is ready for pickup!",
          color: "text-purple-600",
        };
      case "CANCELLED":
        return {
          badge: (
            <Badge variant="outline" className="text-gray-600 border-gray-200">
              Cancelled
            </Badge>
          ),
          icon: <XCircle className="h-5 w-5 text-gray-600" />,
          message: "This order has been cancelled",
          color: "text-gray-600",
        };
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          icon: <Clock className="h-5 w-5" />,
          message: "Order status unknown",
          color: "text-muted-foreground",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePaymentConfirmation = async () => {
    if (!order) return;

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          status: "PAYMENT_COMPLETED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm payment");
      }

      // Refresh order data
      window.location.reload();
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Failed to confirm payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Order Not Found
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {error ||
                  "The order you are looking for does not exist or the order number is invalid."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {statusInfo.icon}
            <h1 className="text-2xl font-bold">Order Tracking</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-mono">{order.orderNumber}</span>
          </div>
          {statusInfo.badge}
        </div>

        {/* Status Message */}
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <p className={`text-lg font-medium ${statusInfo.color}`}>
              {statusInfo.message}
            </p>
            {order.status === "CONFIRMED" && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <Hash className="h-5 w-5" />
                  <span className="text-xl font-bold">
                    Token: {order.orderNumber.slice(-6)}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  Show this token number to the vendor when collecting your
                  order
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Confirmation Button */}
        {order.status === "PENDING_PAYMENT" && (
          <Card className="mb-6">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">
                Have you completed the UPI payment?
              </p>
              <Button onClick={handlePaymentConfirmation} className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Store Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Store Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold text-lg">{order.store.name}</div>
              {order.store.address && (
                <div className="text-muted-foreground">
                  {order.store.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Ordered on:</span>
                </div>
                <span>{formatDate(order.createdAt)}</span>
              </div>

              {order.paymentCompletedAt && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment completed:</span>
                  </div>
                  <span>{formatDate(order.paymentCompletedAt)}</span>
                </div>
              )}

              {order.confirmedAt && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirmed at:</span>
                  </div>
                  <span>{formatDate(order.confirmedAt)}</span>
                </div>
              )}

              {order.completedAt && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Completed at:</span>
                  </div>
                  <span>{formatDate(order.completedAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        {order.customer && (order.customer.name || order.customer.phone) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.customer.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{order.customer.name}</span>
                  </div>
                )}
                {order.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({order.orderItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.menuItem.isVeg ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{item.menuItem.price} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
