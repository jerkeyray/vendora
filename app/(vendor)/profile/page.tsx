"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Spinner } from "@/components/ui/spinner";

type Vendor = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  upiId?: string;
  store?: {
    id: string;
    name: string;
    address?: string;
  };
} | null;

export default function Profile() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email as string | undefined;
  const [vendor, setVendor] = useState<Vendor>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: "", address: "" });
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/vendor/get?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => setVendor(data.vendor || null));
  }, [email]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={(session.user.image as string | null) || undefined}
                  alt={session.user.name as string}
                  fallback={
                    (session.user.name as string) ||
                    (session.user.email as string)
                  }
                  email={session.user.email as string}
                  size={48}
                />
                <div className="space-y-1">
                  <div className="text-sm font-medium">{session.user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDialog(true)}
                  className="border rounded-md px-3 py-2 text-xs"
                >
                  Setup Store
                </button>
                <SignOutButton />
              </div>
            </div>

            <div className="mt-6 grid gap-2 text-sm">
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Store name</span>
                <span>{vendor?.store?.name || "-"}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-[60%]">
                  {vendor?.store?.address || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Phone</span>
                <span>{vendor?.phone || "-"}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">UPI ID</span>
                <span>{vendor?.upiId || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {showDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDialog(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-5 text-foreground shadow-xl">
              <div className="mb-3 text-base font-semibold">Setup Store</div>
              <div className="grid gap-3">
                <input
                  aria-label="Store Name"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, name: e.target.value })
                  }
                  placeholder="Store name"
                />
                <input
                  aria-label="Address"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={storeForm.address}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, address: e.target.value })
                  }
                  placeholder="Address (optional)"
                />
                <div className="pt-1 flex justify-end gap-2">
                  <button
                    className="border rounded-md px-3 py-2 text-xs"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                    onClick={async () => {
                      if (!email || !storeForm.name.trim()) return;
                      const res = await fetch("/api/store/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          name: storeForm.name.trim(),
                          address: storeForm.address.trim() || undefined,
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setVendor((v: Vendor) => ({
                          ...(v || { id: "", email: "", name: "" }),
                          store: data.store,
                        }));
                        window.dispatchEvent(new Event("vendor:updated"));
                        setToast({
                          show: true,
                          message: "Store setup successful",
                        });
                        setShowDialog(false);
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 rounded-md border bg-background px-4 py-2 text-sm shadow-md">
            {toast.message}
          </div>
        )}
      </div>
    </main>
  );
}
