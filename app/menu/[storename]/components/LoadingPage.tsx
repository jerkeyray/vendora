import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    </div>
  );
}
