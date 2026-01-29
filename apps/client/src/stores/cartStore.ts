import { CartStoreActionsType, CartStoreStateType, CartItemType, CartItemsType } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const useCartStore = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set, get) => ({
      cart: [],
      hasHydrated: false,
      
      addToCart: async (product) => {
        // Optimistic update
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (p) =>
              p.id === product.id &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor
          );

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += product.quantity || 1;
            return { cart: updatedCart };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...product,
                quantity: product.quantity || 1,
                selectedSize: product.selectedSize,
                selectedColor: product.selectedColor,
              },
            ],
          };
        });

        // Backend Sync
        const token = Cookies.get("token");
        if (token) {
          try {
             // Map frontend product to backend expected payload
             // Backend expects: productId, quantity, name, price, selectedSize, selectedColor, image
             const payload = {
                productId: product.id,
                quantity: product.quantity || 1,
                name: product.name,
                price: product.price,
                selectedSize: product.selectedSize,
                selectedColor: product.selectedColor,
                image: product.images?.[product.selectedColor] || Object.values(product.images || {})[0]
             };

             await fetch(`${apiBaseUrl}/cart/item`, {
                method: "POST",
                headers: {
                   "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
             });
          } catch (error) {
             console.error("Failed to sync cart item with backend", error);
          }
        }
      },

      removeFromCart: async (product) => {
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              !(
                p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor
              )
          ),
        }));

        const token = Cookies.get("token");
        if (token) {
           try {
              const query = new URLSearchParams({
                  size: product.selectedSize,
                  color: product.selectedColor
              });
              await fetch(`${apiBaseUrl}/cart/item/${product.id}?${query.toString()}`, {
                 method: "DELETE",
                 headers: {
                    Authorization: `Bearer ${token}`
                 }
              });
           } catch (error) {
              console.error("Failed to remove cart item from backend", error);
           }
        }
      },

      clearCart: async () => {
         set({ cart: [] });
         const token = Cookies.get("token");
         if (token) {
            try {
               await fetch(`${apiBaseUrl}/cart`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }
               });
            } catch (error) {
               console.error("Failed to clear backend cart", error);
            }
         }
      },

      fetchCart: async () => {
         const token = Cookies.get("token");
         if (!token) return;

         try {
            const response = await fetch(`${apiBaseUrl}/cart`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
               const data = await response.json();
               // Transform backend cart items to frontend CartItemsType
               // Backend: { items: [{ productId, quantity, name, price, selectedSize, selectedColor, image }] }
               // Frontend expects: ProductType & { quantity... }
               // This is tricky. Backend doesn't store full Product details (shortDescription, description, images map, etc.)
               // We only receive what we saved.
               // For now, we construct a partial object.
               
               const mappedItems: CartItemsType = (data.items || []).map((item: any) => ({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    selectedSize: item.selectedSize || '',
                    selectedColor: item.selectedColor || '',
                    // Missing fields from ProductType, providing defaults
                    shortDescription: '',
                    description: '',
                    sizes: [],
                    colors: [],
                    images: item.image ? { [item.selectedColor || 'default']: item.image } : {} 
               }));
               
               set({ cart: mappedItems });
            }
         } catch (error) {
            console.error("Failed to fetch cart", error);
         }
      }
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

export default useCartStore;
