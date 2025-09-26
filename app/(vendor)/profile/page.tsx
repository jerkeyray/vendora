"use client";

import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function Profile() {
  const { data: session, isPending } = useSession();

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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={(session.user.image as string | null) || undefined}
                alt={session.user.name as string}
                fallback={(session.user.name as string) || (session.user.email as string)}
                email={session.user.email as string}
                size={56}
              />
              <div>
                <div className="text-base font-medium">{session.user.name}</div>
                <div className="text-sm text-muted-foreground">{session.user.email}</div>
              </div>
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


