import { Suspense } from "react";
import { getStoreBySlug, getMenuByStoreId } from "./lib/data";
import { MenuClient } from "./components/MenuClient";
import { ErrorPage } from "./components/ErrorPage";
import { LoadingPage } from "./components/LoadingPage";

interface OrderPageProps {
  params: {
    storename: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const storeSlug = params.storename;

  // Server-side data fetching
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    return <ErrorPage error="Store not found" />;
  }

  const menu = await getMenuByStoreId(store.id);

  if (!menu) {
    return <ErrorPage error="Menu not found for this store" />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <MenuClient store={store} menu={menu} />
    </Suspense>
  );
}
