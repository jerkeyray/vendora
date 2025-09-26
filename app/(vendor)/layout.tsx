"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  useEffect(() => {
    if (!isPending && !session) {
      redirect("/");
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
          <Link href="/dashboard" className="text-2xl font-bold text-black">
            Vendora
          </Link>

          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
            <Link href="/dashboard" className={`text-sm font-medium ${isActive("/dashboard") ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}>Dashboard</Link>
            <Link href="/menu" className={`text-sm font-medium ${isActive("/menu") ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}>Menu</Link>
            <Link href="/orders" className={`text-sm font-medium ${isActive("/orders") ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}>Orders</Link>
            <Link href="/analytics" className={`text-sm font-medium ${isActive("/analytics") ? "text-foreground" : "text-foreground/80 hover:text-foreground"}`}>Analytics</Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {session.user.name}</span>
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

      {children}
    </main>
  );
}


