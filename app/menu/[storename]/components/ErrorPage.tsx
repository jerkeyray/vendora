import { ShoppingCart } from "lucide-react";

interface ErrorPageProps {
  error?: string;
}

export function ErrorPage({ error }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Store Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {error ||
                "The store you are looking for does not exist or is currently unavailable."}
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Looking for a specific store? Make sure the store name in the URL
              is correct, or contact the vendor for the correct link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
