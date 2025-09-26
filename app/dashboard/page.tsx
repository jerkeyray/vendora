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
    name: "",
    email: "",
    phone: "",
    upiId: "",
  });

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
          setForm((f) => ({ ...f, email: email, name: session?.user?.name || "" }));
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

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      form.email.includes("@") &&
      form.upiId.trim().length > 3
    );
  }, [form]);

  const submitSetup = async () => {
    if (!canSubmit || !email) return;
    const res = await fetch("/api/vendor/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setVendorStatus('exists');
    }
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
    <main className="min-h-screen bg-background">
      <Dialog open={vendorStatus === 'needs-setup'} onOpenChange={() => {}} title="Complete your vendor setup">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              disabled
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="upi">UPI ID</Label>
            <Input
              id="upi"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              placeholder="yourname@bank"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <Button onClick={submitSetup} disabled={!canSubmit}>
              Save and continue
            </Button>
          </div>
        </div>
      </Dialog>
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
          <h1 className="text-2xl font-bold">Vendora Dashboard</h1>

          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground">Dashboard</Link>
            <Link href="/menu" className="text-sm font-medium text-foreground/80 hover:text-foreground">Menu</Link>
            <Link href="/orders" className="text-sm font-medium text-foreground/80 hover:text-foreground">Orders</Link>
            <Link href="/analytics" className="text-sm font-medium text-foreground/80 hover:text-foreground">Analytics</Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {session.user.name}
            </span>
            <Link href="/profile" aria-label="Profile">
              <Avatar
                src={(session.user.image as string | null) || undefined}
                alt={session.user.name as string}
                fallback={(session.user.name as string) || (session.user.email as string)}
                email={session.user.email as string}
                size={36}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8">
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
