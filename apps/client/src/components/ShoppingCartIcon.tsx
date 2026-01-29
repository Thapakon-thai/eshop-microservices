"use client";

import useCartStore from "@/stores/cartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  if (!hasHydrated) return null;

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="w-4 h-4 text-gray-600" />
      {isAuthenticated && itemCount > 0 && (
        <span className="absolute -top-3 -right-3 bg-amber-400 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default ShoppingCartIcon;
