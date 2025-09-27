import { Store } from "../types";

interface StoreHeaderProps {
  store: Store;
}

export function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <div className="mb-8 text-center lg:text-left">
      <h1 className="text-3xl font-bold text-foreground mb-2">{store.name}</h1>
      {store.description && (
        <p className="text-muted-foreground mb-2">{store.description}</p>
      )}
      {store.address && (
        <p className="text-sm text-muted-foreground">{store.address}</p>
      )}
      <div className="h-1 w-20 bg-primary rounded-full mx-auto lg:mx-0 mt-4"></div>
    </div>
  );
}
