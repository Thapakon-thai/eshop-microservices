import { PaymentFormInputs, paymentFormSchema, CartItemType, ShippingFormInputs } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import useCartStore from "@/stores/cartStore";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Test card details for easy testing
const TEST_CARD = {
  cardHolder: "Test User",
  cardNumber: "4242424242424242",
  expirationDate: "12/28",
  cvv: "123",
};

interface PaymentFormProps {
  cart: CartItemType[];
  shippingForm: ShippingFormInputs;
}

const PaymentForm = ({ cart, shippingForm }: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
  });

  // Auto-fill test card
  const fillTestCard = () => {
    setValue("cardHolder", TEST_CARD.cardHolder);
    setValue("cardNumber", TEST_CARD.cardNumber);
    setValue("expirationDate", TEST_CARD.expirationDate);
    setValue("cvv", TEST_CARD.cvv);
  };

  const handlePaymentForm: SubmitHandler<PaymentFormInputs> = async (data) => {
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Calculate total
      const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const total = subtotal - subtotal * 0.1 + 10; // 10% discount + $10 shipping

      // Create order via API - Backend only expects items array
      const token = Cookies.get("token");
      const orderPayload = {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price.toString(), // Backend expects decimal as string
        })),
      };

      const response = await fetch(`${apiBaseUrl}/order/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderResult = await response.json();

      // Success!
      setIsSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");

      // Redirect to success page after a moment
      setTimeout(() => {
        router.push(`/order-success?orderId=${orderResult.id || "mock-123"}`);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-semibold text-green-700">Payment Successful!</h3>
        <p className="text-gray-500 text-sm">Redirecting to your order confirmation...</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handlePaymentForm)}
    >
      {/* Test Mode Banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <div className="flex-1">
          <p className="text-xs text-amber-800 font-medium">Test Mode</p>
          <p className="text-xs text-amber-600">Use test card for demo checkout</p>
        </div>
        <button
          type="button"
          onClick={fillTestCard}
          className="text-xs bg-amber-400 hover:bg-amber-500 text-gray-800 px-3 py-1 rounded-md font-medium transition-colors"
        >
          Fill Test Card
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cardHolder" className="text-xs text-gray-500 font-medium">
          Name on card
        </label>
        <input
          className="border-b border-gray-200 py-2 outline-none text-sm"
          type="text"
          id="cardHolder"
          placeholder="John Doe"
          disabled={isProcessing}
          {...register("cardHolder")}
        />
        {errors.cardHolder && (
          <p className="text-xs text-red-500">{errors.cardHolder.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cardNumber" className="text-xs text-gray-500 font-medium">
          Card Number
        </label>
        <input
          className="border-b border-gray-200 py-2 outline-none text-sm"
          type="text"
          id="cardNumber"
          placeholder="4242424242424242"
          disabled={isProcessing}
          {...register("cardNumber")}
        />
        {errors.cardNumber && (
          <p className="text-xs text-red-500">{errors.cardNumber.message}</p>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="expirationDate" className="text-xs text-gray-500 font-medium">
            Expiration Date
          </label>
          <input
            className="border-b border-gray-200 py-2 outline-none text-sm"
            type="text"
            id="expirationDate"
            placeholder="12/28"
            disabled={isProcessing}
            {...register("expirationDate")}
          />
          {errors.expirationDate && (
            <p className="text-xs text-red-500">{errors.expirationDate.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="cvv" className="text-xs text-gray-500 font-medium">
            CVV
          </label>
          <input
            className="border-b border-gray-200 py-2 outline-none text-sm"
            type="text"
            id="cvv"
            placeholder="123"
            disabled={isProcessing}
            {...register("cvv")}
          />
          {errors.cvv && (
            <p className="text-xs text-red-500">{errors.cvv.message}</p>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2 mt-4'>
        <Image src="/klarna.png" alt="klarna" width={50} height={25} className="rounded-md"/>
        <Image src="/cards.png" alt="cards" width={50} height={25} className="rounded-md"/>
        <Image src="/stripe.png" alt="stripe" width={50} height={25} className="rounded-md"/>
      </div>
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 transition-all duration-300 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Checkout
            <ShoppingCart className="w-3 h-3" />
          </>
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
