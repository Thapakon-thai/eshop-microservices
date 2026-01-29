"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Cookies from "js-cookie";
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  user_id: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: { 
    icon: <Clock className="w-4 h-4" />, 
    color: "text-amber-600", 
    bg: "bg-amber-50" 
  },
  processing: { 
    icon: <Package className="w-4 h-4" />, 
    color: "text-blue-600", 
    bg: "bg-blue-50" 
  },
  completed: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: "text-green-600", 
    bg: "bg-green-50" 
  },
  cancelled: { 
    icon: <XCircle className="w-4 h-4" />, 
    color: "text-red-600", 
    bg: "bg-red-50" 
  },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Hydrate auth state from cookies
    checkAuth();
    
    // Check token directly from cookies (more reliable than zustand on first mount)
    const token = Cookies.get("access_token") || Cookies.get("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/order/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else if (res.status === 401) {
          router.push("/auth/signin");
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        setError("Something went wrong");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [checkAuth, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-gray-500 text-sm">View all your past orders</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.id}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}
                    >
                      {status.icon}
                      <span className="text-sm font-medium capitalize">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Product {item.product_id.slice(-6)}
                              </p>
                              <p className="text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">${item.price}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      {(order.subtotal > 0 || order.shipping_fee > 0 || order.discount > 0) ? (
                        <>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount</span>
                              <span>-${order.discount.toFixed(2)}</span>
                            </div>
                          )}
                          {order.shipping_fee > 0 && (
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Shipping</span>
                              <span>${order.shipping_fee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-100">
                            <span className="font-semibold">Total</span>
                            <span className="text-lg font-bold">
                              ${order.total_amount?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Total</span>
                          <span className="text-lg font-bold">
                            ${order.total_amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
