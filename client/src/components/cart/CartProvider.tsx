import { createContext, useContext, useState } from "react";
import { CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CartContextType {
  items: CartItem[];
  addItem: (itemId: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const sessionId = crypto.randomUUID(); // Simple session management

  const addItem = async (itemId: number) => {
    try {
      const res = await apiRequest("POST", "/api/cart", { itemId }, {
        headers: {
          "x-session-id": sessionId
        }
      });
      const newItem = await res.json();
      setItems([...items, newItem]);
      toast({
        title: "Item added to cart",
        description: "The item has been added to your cart successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await apiRequest("DELETE", `/api/cart/${itemId}`, undefined, {
        headers: {
          "x-session-id": sessionId
        }
      });
      setItems(items.filter(item => item.itemId !== itemId));
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}