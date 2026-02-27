import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { verifyCheckoutSession } from "@/lib/api";
import type { Order } from "@shared/schema";

export default function CheckoutSuccess() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setError("No payment session found");
      setLoading(false);
      return;
    }

    verifyCheckoutSession(sessionId)
      .then((result) => {
        setOrder(result.order);
      })
      .catch((err) => {
        setError(err.message || "Failed to verify payment");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#c9a962] mx-auto" />
          <p className="text-stone-500 font-light">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-stone-800 mb-3">Something Went Wrong</h1>
            <p className="text-stone-500 font-light">{error || "Unable to confirm your order."}</p>
          </div>
          <Link href="/checkout">
            <Button variant="outline" className="rounded-none px-8 h-12 text-sm tracking-wider uppercase border-stone-300">
              Try Again
            </Button>
          </Link>
        </div>
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
          <h1 className="font-serif text-3xl text-stone-800 mb-3" data-testid="text-order-confirmed">Order Confirmed</h1>
          <p className="text-stone-500 font-light">Thank you for your purchase!</p>
        </div>
        <div className="bg-[#f8f6f3] p-6 text-left space-y-2" data-testid="order-summary-confirmed">
          <p className="text-sm text-stone-600"><strong>Order #:</strong> {order.id}</p>
          <p className="text-sm text-stone-600"><strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}</p>
          <p className="text-sm text-stone-600"><strong>Status:</strong> {order.status === 'confirmed' ? 'Payment Confirmed' : order.status}</p>
          <p className="text-sm text-stone-500 mt-4">A confirmation email has been sent to your inbox.</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="rounded-none px-8 h-12 text-sm tracking-wider uppercase border-stone-300" data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
