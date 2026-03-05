import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Loader2, ArrowLeft, ShoppingBag, Tag, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent, createOrder, createCheckoutSession, validatePromoCode } from "@/lib/api";
import { SITE_CONTENT } from "@/lib/data";
import productPhotoFallback from "@assets/Piliora_Product_Photo_1772210910474.JPG";


const shippingSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  shippingAddress: z.string().min(5, "Street address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State is required"),
  shippingZip: z.string().min(5, "ZIP code is required"),
});

type ShippingForm = z.infer<typeof shippingSchema>;

interface AppliedPromo {
  code: string;
  discount: number;
  freeShipping: boolean;
  label: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const params = new URLSearchParams(window.location.search);
  const quantity = Math.max(1, parseInt(params.get("qty") || "1"));

  const { data: apiContent } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
    placeholderData: SITE_CONTENT,
  });

  const content = apiContent || SITE_CONTENT;
  const product = content.product;
  const packOptions = (product.packOptions || SITE_CONTENT.product.packOptions || []).filter((p: any) => p.visible);
  const selectedPack = packOptions.find((p: any) => p.quantity === quantity) || packOptions[0];
  const subtotal = selectedPack.price;

  const discountAmount = appliedPromo ? Math.round(subtotal * appliedPromo.discount * 100) / 100 : 0;
  const discountedSubtotal = subtotal - discountAmount;

  const NY_TAX_RATE = 0.08875;
  const taxAmount = Math.round(discountedSubtotal * NY_TAX_RATE * 100) / 100;
  const SHIPPING_COST = 1.99;
  const shippingAmount = SHIPPING_COST;
  const total = discountedSubtotal + taxAmount + shippingAmount;

  const form = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      phone: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
    },
  });

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const result = await validatePromoCode(promoInput.trim());
      setAppliedPromo({
        code: result.code,
        discount: result.discount,
        freeShipping: result.freeShipping,
        label: result.label,
      });
      setPromoInput("");
    } catch (error: any) {
      setPromoError(error.message || "Invalid promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
  };

  const onSubmit = async (data: ShippingForm) => {
    setLoading(true);
    try {
      const orderResult = await createOrder({
        ...data,
        quantity,
        promoCode: appliedPromo?.code,
      });

      sessionStorage.setItem("piliora_order", JSON.stringify({
        id: orderResult.order.id,
        total: Number(orderResult.order.totalAmount).toFixed(2),
        email: data.customerEmail,
      }));

      try {
        const sessionResult = await createCheckoutSession({
          orderId: orderResult.order.id,
          customerEmail: data.customerEmail,
          quantity,
          promoCode: appliedPromo?.code,
        });
        if (sessionResult.url) {
          window.location.href = sessionResult.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (sessionErr: any) {
        throw new Error("Payment processing unavailable. Please try again later.");
      }
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/product">
          <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors" data-testid="link-back-to-product">
            <ArrowLeft className="w-4 h-4" /> Back to Product
          </button>
        </Link>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <h1 className="font-serif text-3xl text-stone-800 mb-8" data-testid="text-checkout-heading">Checkout</h1>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-stone-700">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input id="customerName" {...form.register("customerName")} placeholder="Jane Doe" data-testid="input-checkout-name" />
                    {form.formState.errors.customerName && <p className="text-red-500 text-xs">{form.formState.errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input id="customerEmail" type="email" {...form.register("customerEmail")} placeholder="jane@example.com" data-testid="input-checkout-email" />
                    {form.formState.errors.customerEmail && <p className="text-red-500 text-xs">{form.formState.errors.customerEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="(555) 123-4567" data-testid="input-checkout-phone" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="font-serif text-xl text-stone-700">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Street Address</Label>
                    <Input id="shippingAddress" {...form.register("shippingAddress")} placeholder="123 Main Street" data-testid="input-checkout-address" />
                    {form.formState.errors.shippingAddress && <p className="text-red-500 text-xs">{form.formState.errors.shippingAddress.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">City</Label>
                      <Input id="shippingCity" {...form.register("shippingCity")} placeholder="New York" data-testid="input-checkout-city" />
                      {form.formState.errors.shippingCity && <p className="text-red-500 text-xs">{form.formState.errors.shippingCity.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingState">State</Label>
                      <Input id="shippingState" {...form.register("shippingState")} placeholder="NY" data-testid="input-checkout-state" />
                      {form.formState.errors.shippingState && <p className="text-red-500 text-xs">{form.formState.errors.shippingState.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingZip">ZIP Code</Label>
                      <Input id="shippingZip" {...form.register("shippingZip")} placeholder="10001" data-testid="input-checkout-zip" />
                      {form.formState.errors.shippingZip && <p className="text-red-500 text-xs">{form.formState.errors.shippingZip.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white hover:bg-stone-800 rounded-none h-14 text-sm tracking-[0.15em] uppercase"
                data-testid="button-place-order"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to Payment...</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Proceed to Payment — ${total.toFixed(2)}</>
                )}
              </Button>

              <p className="text-xs text-center text-stone-400">
                You'll be redirected to Stripe's secure payment page to complete your purchase.
              </p>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-60 bg-[#f8f6f3] p-6" data-testid="checkout-order-summary">
              <h2 className="font-serif text-xl text-stone-700 mb-6">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-24 bg-white overflow-hidden flex-shrink-0">
                  <img src={selectedPack?.image || product.image || productPhotoFallback} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-serif text-sm text-stone-800" data-testid="text-checkout-product-name">{product.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">{selectedPack.label}</p>
                  <p className="text-sm text-stone-700 mt-2">${selectedPack.price.toFixed(2)}</p>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span data-testid="text-checkout-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({Math.round(appliedPromo!.discount * 100)}% off)</span>
                    <span data-testid="text-checkout-discount">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  {shippingAmount === 0 ? (
                    <span className="text-green-600" data-testid="text-checkout-shipping">Free</span>
                  ) : (
                    <span data-testid="text-checkout-shipping">${shippingAmount.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>NY State Tax (8.875%)</span>
                  <span data-testid="text-checkout-tax">${taxAmount.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-serif text-lg text-stone-800">
                <span>Total</span>
                <span data-testid="text-checkout-total">${total.toFixed(2)}</span>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/50 space-y-4">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-sm" data-testid="promo-applied">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-800">{appliedPromo.code}</p>
                        <p className="text-xs text-green-600">{appliedPromo.label}</p>
                      </div>
                    </div>
                    <button onClick={handleRemovePromo} className="text-stone-400 hover:text-stone-600" data-testid="button-remove-promo">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <Input
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyPromo(); } }}
                          placeholder="Promo code"
                          className="pl-9 text-xs h-9 rounded-sm uppercase"
                          data-testid="input-promo-code"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="rounded-sm h-9 text-xs px-4"
                        data-testid="button-apply-promo"
                      >
                        {promoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs" data-testid="text-promo-error">{promoError}</p>}
                  </div>
                )}

                {product.amazonLink && product.amazonLink !== "" && (
                  <a
                    href={product.amazonLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#c9a962] hover:text-[#e0c47a] flex items-center gap-1 transition-colors"
                    data-testid="link-also-amazon"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Also available on Amazon
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
