import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";

interface OrderInfo {
  id: number;
  total: string;
  email: string;
}

export default function CheckoutSuccess() {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("piliora_order");
    if (stored) {
      try {
        setOrderInfo(JSON.parse(stored));
      } catch {}
      sessionStorage.removeItem("piliora_order");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      fetch(`/api/checkout/verify?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.order) {
            setOrderInfo({
              id: data.order.id,
              total: Number(data.order.totalAmount).toFixed(2),
              email: data.order.customerEmail,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-stone-400">Confirming your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-stone-800 mb-3" data-testid="text-order-confirmed">Thank You for Your Order</h1>
          <p className="text-stone-500 font-light">Your payment is being processed.</p>
        </div>
        {orderInfo && (
          <div className="bg-[#f8f6f3] p-6 text-left space-y-2" data-testid="order-summary-confirmed">
            <p className="text-sm text-stone-600"><strong>Order #:</strong> {orderInfo.id}</p>
            <p className="text-sm text-stone-600"><strong>Total:</strong> ${orderInfo.total}</p>
            <p className="text-sm text-stone-500 mt-4">A confirmation will be sent to {orderInfo.email}.</p>
          </div>
        )}
        {!orderInfo && (
          <div className="bg-[#f8f6f3] p-6 text-left space-y-2">
            <p className="text-sm text-stone-500">Your order has been received. You will receive a confirmation email shortly.</p>
          </div>
        )}
        <Link href="/">
          <Button variant="outline" className="rounded-none px-8 h-12 text-sm tracking-wider uppercase border-stone-300" data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
