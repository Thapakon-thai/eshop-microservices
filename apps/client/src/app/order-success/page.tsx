import { CheckCircle, Home, Package } from "lucide-react";
import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order ID */}
      {orderId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="font-mono font-medium text-gray-800">{orderId}</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-4 max-w-md text-center">
        <Package className="w-6 h-6 text-amber-600 mx-auto mb-2" />
        <p className="text-sm text-amber-800">
          You will receive an email confirmation shortly with your order details
          and tracking information.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
