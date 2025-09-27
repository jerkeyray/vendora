export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  categories: Category[];
}

export interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface PaymentInfo {
  orderNumber: string;
  upiId: string;
  amount: number;
  storeName: string;
}
