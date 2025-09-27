"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle,
  XCircle,
  Package,
  Phone,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
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
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentCompletedAt: string | null;
  confirmedAt: string | null;
  orderItems: OrderItem[];
  customer: Customer | null;
  store: Store;
}

interface OrdersData {
  pending: Order[];
  confirmed: Order[];
  completed: Order[];
  all: Order[];
}

export default function VendorOrdersPage() {
  const { data: session, isPending } = useSession();
  const [orders, setOrders] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [vendorStoreId, setVendorStoreId] = useState<string | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<
    string | null
  >(null);
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null
  );

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  const fetchOrders = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/orders/vendor?email=${encodeURIComponent(session.user.email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);

      // Store vendor store ID for realtime subscription
      if (data.vendor?.store?.id) {
        setVendorStoreId(data.vendor.store.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Fetch a single new order with all relations
  const fetchNewOrderWithRelations = useCallback(
    async (orderId: string) => {
      try {
        const response = await fetch(`/api/orders/get-single?id=${orderId}`);
        if (!response.ok) return;

        const { order } = await response.json();

        setOrders((prevOrders) => {
          if (!prevOrders) return prevOrders;

          // Check if order already exists (avoid duplicates)
          const exists = prevOrders.all.find((o) => o.id === orderId);
          if (exists) return prevOrders;

          // Add new order to the beginning of all orders
          const updatedAll = [order, ...prevOrders.all];

          // Re-categorize orders
          const pending = updatedAll.filter(
            (order) => order.status === "PAYMENT_COMPLETED"
          );
          const confirmed = updatedAll.filter(
            (order) => order.status === "CONFIRMED"
          );
          const completed = updatedAll.filter((order) =>
            ["COMPLETED", "REJECTED", "CANCELLED"].includes(order.status)
          );

          return { pending, confirmed, completed, all: updatedAll };
        });
      } catch (err) {
        console.error("Failed to fetch new order:", err);
        // Fallback to full refresh if single order fetch fails
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!vendorStoreId) return;

    // Check if Supabase is properly configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.warn(
        "Supabase environment variables not configured, skipping realtime setup"
      );
      setRealtimeStatus("disconnected");
      return;
    }

    const setupRealtimeSubscription = async () => {
      try {
        setRealtimeStatus("connecting");

        // Clean up existing subscription
        if (subscriptionRef.current) {
          await supabase.removeChannel(subscriptionRef.current);
        }

        // Create new subscription for orders table
        subscriptionRef.current = supabase
          .channel("orders_changes")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "orders",
              filter: `storeId=eq.${vendorStoreId}`,
            },
            (payload) => {
              console.log("Order change detected:", payload);

              // Handle different types of changes
              if (payload.eventType === "INSERT") {
                // New order created
                console.log("New order received:", payload.new);
                const newOrder = payload.new as {
                  id: string;
                  orderNumber?: string;
                };

                // Show notification for new order
                setNewOrderNotification(
                  `New order #${newOrder.orderNumber?.slice(-6) || "received"}`
                );

                // Auto-hide notification after 5 seconds
                setTimeout(() => {
                  setNewOrderNotification(null);
                }, 5000);

                // Fetch the complete new order with relations instead of full refresh
                fetchNewOrderWithRelations(newOrder.id);
              } else if (payload.eventType === "UPDATE") {
                // Order status updated
                console.log("Order updated:", payload.new);
                setOrders((prevOrders) => {
                  if (!prevOrders) return prevOrders;

                  const updatedOrder = payload.new as Order;
                  const updatedAll = prevOrders.all.map((order) =>
                    order.id === updatedOrder.id ? updatedOrder : order
                  );

                  // Re-categorize orders based on status
                  const pending = updatedAll.filter(
                    (order) => order.status === "PAYMENT_COMPLETED"
                  );
                  const confirmed = updatedAll.filter(
                    (order) => order.status === "CONFIRMED"
                  );
                  const completed = updatedAll.filter((order) =>
                    ["COMPLETED", "REJECTED", "CANCELLED"].includes(
                      order.status
                    )
                  );

                  return {
                    pending,
                    confirmed,
                    completed,
                    all: updatedAll,
                  };
                });
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              setRealtimeStatus("connected");
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setRealtimeStatus("disconnected");
            }
          });
      } catch (error) {
        console.error("Failed to set up realtime subscription:", error);
        setRealtimeStatus("disconnected");
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [vendorStoreId, fetchOrders, fetchNewOrderWithRelations]);

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    try {
      setUpdatingOrders((prev) => new Set([...prev, orderNumber]));

      // Optimistically update the UI first for better UX
      setOrders((prevOrders) => {
        if (!prevOrders) return prevOrders;

        const updatedAll = prevOrders.all.map((order) =>
          order.orderNumber === orderNumber ? { ...order, status } : order
        );

        // Re-categorize orders
        const pending = updatedAll.filter(
          (order) => order.status === "PAYMENT_COMPLETED"
        );
        const confirmed = updatedAll.filter(
          (order) => order.status === "CONFIRMED"
        );
        const completed = updatedAll.filter((order) =>
          ["COMPLETED", "REJECTED", "CANCELLED"].includes(order.status)
        );

        return { pending, confirmed, completed, all: updatedAll };
      });

      const response = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Realtime will handle the final update, but optimistic update provides instant feedback
    } catch (err) {
      console.error("Error updating order:", err);

      // Revert optimistic update on error
      fetchOrders();
      alert("Failed to update order. Please try again.");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderNumber);
        return newSet;
      });
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

  const getTokenNumber = (orderNumber: string) => {
    return orderNumber.slice(-6);
  };

  const toggleOrderExpansion = (orderNumber: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderNumber)) {
        newSet.delete(orderNumber);
      } else {
        newSet.add(orderNumber);
      }
      return newSet;
    });
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchOrders}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Orders Management
            </h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  realtimeStatus === "connected"
                    ? "bg-green-500"
                    : realtimeStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {realtimeStatus === "connected"
                  ? "Live Updates"
                  : realtimeStatus === "connecting"
                  ? "Connecting..."
                  : "Offline"}
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            Accept or reject incoming orders and manage your order queue
            {realtimeStatus === "connected" && (
              <span className="text-green-600 ml-2">
                • Real-time updates active
              </span>
            )}
          </p>

          {/* New Order Notification */}
          {newOrderNotification && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-green-700 font-medium text-sm">
                🔔 {newOrderNotification}
              </span>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {orders?.pending.length || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders?.confirmed.length || 0}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders?.completed.length || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {orders?.all.length || 0}
              </div>
              <div className="text-sm text-gray-600">All Orders</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Incoming Order Requests */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Incoming Order Requests
                </h2>
                <Badge
                  variant="outline"
                  className={`text-blue-600 border-blue-200 bg-blue-50 ${
                    (orders?.pending?.length || 0) > 0 ? "animate-pulse" : ""
                  }`}
                >
                  {orders?.pending.length || 0} pending
                </Badge>
                {(orders?.pending?.length || 0) > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
              <p className="text-gray-600 ml-7">
                Orders waiting for your confirmation - respond quickly to keep
                customers happy!
                {(orders?.pending?.length || 0) > 0 && (
                  <span className="text-blue-600 font-medium ml-2">
                    • New orders available
                  </span>
                )}
              </p>
            </div>

            {!orders || orders.pending.length === 0 ? (
              <Card className="bg-white shadow-sm border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900">
                    No pending orders
                  </h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    New orders will appear here for confirmation. You&apos;ll be
                    notified when customers place orders.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.pending.map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                              New Order
                            </span>
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            #{getTokenNumber(order.orderNumber)}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ₹{order.totalAmount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.orderItems.length} items
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      {order.customer && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Customer
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            {order.customer.name && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="font-medium">
                                  {order.customer.name}
                                </span>
                              </div>
                            )}
                            {order.customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="font-mono">
                                  {order.customer.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">
                          Order Items:
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {order.orderItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    item.menuItem.isVeg
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <span className="font-medium">
                                  {item.menuItem.name}
                                </span>
                                <span className="text-gray-500">
                                  ×{item.quantity}
                                </span>
                              </div>
                              <span className="font-semibold">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() =>
                            updateOrderStatus(order.orderNumber, "CONFIRMED")
                          }
                          disabled={updatingOrders.has(order.orderNumber)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                          size="sm"
                        >
                          {updatingOrders.has(order.orderNumber) ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() =>
                            updateOrderStatus(order.orderNumber, "REJECTED")
                          }
                          disabled={updatingOrders.has(order.orderNumber)}
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50 font-medium"
                          size="sm"
                        >
                          {updatingOrders.has(order.orderNumber) ? (
                            <Spinner size="sm" className="mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* All Orders List */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order History
                </h2>
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-200 bg-gray-50"
                >
                  {(orders?.confirmed.length || 0) +
                    (orders?.completed.length || 0)}{" "}
                  total
                </Badge>
              </div>
              <p className="text-gray-600 ml-7">
                Complete order history with token numbers for easy customer
                reference
              </p>
            </div>

            {!orders ||
            (orders.confirmed.length === 0 && orders.completed.length === 0) ? (
              <Card className="bg-white shadow-sm border-dashed border-2 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900">
                    No orders yet
                  </h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    Orders will appear here once customers start placing them
                    through your QR menu.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...orders.confirmed, ...orders.completed].map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-gray-300"
                  >
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between"
                        onClick={() => toggleOrderExpansion(order.orderNumber)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center bg-gray-50 rounded-lg p-3 min-w-[70px]">
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              Token
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              #{getTokenNumber(order.orderNumber)}
                            </div>
                          </div>

                          <div>
                            <div className="font-medium text-gray-900 mb-1">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900">
                              ₹{order.totalAmount}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.orderItems.length} items
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={
                              order.status === "CONFIRMED"
                                ? "text-green-700 border-green-300 bg-green-50 font-medium"
                                : order.status === "COMPLETED"
                                ? "text-purple-700 border-purple-300 bg-purple-50 font-medium"
                                : order.status === "REJECTED"
                                ? "text-red-700 border-red-300 bg-red-50 font-medium"
                                : order.status === "PAYMENT_COMPLETED"
                                ? "text-blue-700 border-blue-300 bg-blue-50 font-medium"
                                : "text-gray-700 border-gray-300 bg-gray-50 font-medium"
                            }
                          >
                            {order.status === "PAYMENT_COMPLETED"
                              ? "Pending"
                              : order.status === "CONFIRMED"
                              ? "Confirmed"
                              : order.status === "COMPLETED"
                              ? "Ready"
                              : order.status === "REJECTED"
                              ? "Rejected"
                              : order.status}
                          </Badge>

                          {expandedOrders.has(order.orderNumber) ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      {expandedOrders.has(order.orderNumber) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          {/* Customer Info */}
                          {order.customer && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                Customer Information
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                {order.customer.name && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                      {order.customer.name}
                                    </span>
                                  </div>
                                )}
                                {order.customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="font-mono text-gray-900">
                                      {order.customer.phone}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700">
                              Order Details:
                            </h4>
                            <div className="space-y-1">
                              {order.orderItems.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-3 h-3 rounded-full ${
                                        item.menuItem.isVeg
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                    <span className="font-medium text-gray-900">
                                      {item.menuItem.name}
                                    </span>
                                    <span className="text-gray-500">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    ₹{item.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Button for Confirmed Orders */}
                          {order.status === "CONFIRMED" && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(
                                  order.orderNumber,
                                  "COMPLETED"
                                );
                              }}
                              disabled={updatingOrders.has(order.orderNumber)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
                              size="sm"
                            >
                              {updatingOrders.has(order.orderNumber) ? (
                                <Spinner size="sm" className="mr-2" />
                              ) : (
                                <Package className="h-4 w-4 mr-2" />
                              )}
                              Mark as Ready for Pickup
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
