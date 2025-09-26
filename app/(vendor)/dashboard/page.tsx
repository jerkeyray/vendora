"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Store,
  Menu,
  QrCode,
  ShoppingBag,
  IndianRupee,
  ChefHat,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email as string | undefined;
  const [vendorStatus, setVendorStatus] = useState<'loading' | 'exists' | 'needs-setup' | 'error'>('loading');
  const hasCheckedRef = useRef<Set<string>>(new Set());
  const [form, setForm] = useState({
    phone: "",
    upiId: "",
    storeName: "",
    address: "",
  });
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  useEffect(() => {
    if (!email || hasCheckedRef.current.has(email)) return;
    
    let cancelled = false;
    
    fetch(`/api/vendor/create?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.exists) {
          setVendorStatus('exists');
          hasCheckedRef.current.add(email);
        } else {
          setVendorStatus('needs-setup');
          hasCheckedRef.current.add(email);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setVendorStatus('error');
        hasCheckedRef.current.delete(email); // Allow retry on error
      });

    return () => {
      cancelled = true;
    };
  }, [email, session?.user?.name]);

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateUPI = (upi: string): boolean => {
    // UPI ID format: username@bank or username@upi
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upi);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Store name validation
    if (!form.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    // Phone validation (optional but if provided, must be valid)
    if (form.phone.trim() && !validatePhone(form.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // UPI ID validation
    if (!form.upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (!validateUPI(form.upiId.trim())) {
      newErrors.upiId = "Please enter a valid UPI ID (e.g., yourname@bank)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canSubmit = useMemo(() => {
    return (
      form.upiId.trim().length > 3 &&
      form.storeName.trim().length > 1 &&
      validatePhone(form.phone.trim()) &&
      validateUPI(form.upiId.trim())
    );
  }, [form]);

  const submitSetup = async () => {
    if (!email || isSubmitting) return;
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setVendorStatus('exists');
    setToast({ show: true, message: 'Onboarding saved' });

    const res = await fetch("/api/vendor/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setVendorStatus('exists');
      setStore(data.store);
    }
    setIsSubmitting(false);
  };

  if (isPending || vendorStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 rounded-md border bg-background px-4 py-2 text-sm shadow-md">
          {toast.message}
        </div>
      )}
      <Dialog open={vendorStatus === 'needs-setup'} onOpenChange={() => {}} title="Complete your vendor setup">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              value={form.storeName}
              onChange={(e) => {
                setForm({ ...form, storeName: e.target.value });
                if (errors.storeName) {
                  setErrors({ ...errors, storeName: "" });
                }
              }}
              placeholder="Your store name"
              className={errors.storeName ? "border-red-500" : ""}
            />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Store address (optional)"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                // Only allow digits and limit to 10 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, phone: value });
                if (errors.phone) {
                  setErrors({ ...errors, phone: "" });
                }
              }}
              placeholder="10 digit phone number (optional)"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="upi">UPI ID *</Label>
            <Input
              id="upi"
              value={form.upiId}
              onChange={(e) => {
                setForm({ ...form, upiId: e.target.value });
                if (errors.upiId) {
                  setErrors({ ...errors, upiId: "" });
                }
              }}
              placeholder="yourname@bank"
              className={errors.upiId ? "border-red-500" : ""}
            />
            {errors.upiId && (
              <p className="text-sm text-red-500">{errors.upiId}</p>
            )}
          </div>
          <div className="pt-2 flex justify-end">
            <Button onClick={submitSetup} disabled={!canSubmit}>
              Save and continue
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Header is provided by (vendor)/layout.tsx */}

      {/* Dashboard Content */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Menu Items
                </CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Items in menu</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Set up your store</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your store details and contact information
                    </p>
                  </div>
                </div>
          <Button variant="outline" onClick={() => setVendorStatus('needs-setup')}>
            Set up vendor
          </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Menu className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Create your menu</h3>
                    <p className="text-sm text-muted-foreground">
                      Add food items, prices, and descriptions
                    </p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Generate QR code</h3>
                    <p className="text-sm text-muted-foreground">
                      Get your unique QR code for customers to scan
                    </p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}


