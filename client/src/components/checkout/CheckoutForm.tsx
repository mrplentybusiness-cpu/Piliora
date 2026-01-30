import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Lock, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  cardName: z.string().min(2, "Name is required"),
  cardNumber: z.string().min(15, "Invalid card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Use MM/YY format"),
  cvc: z.string().min(3, "Invalid CVC"),
});

export function CheckoutForm({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    }
  });

  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    setLoading(true);
    // Simulate NMI API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Processing payment via NMI...", data);
    
    setLoading(false);
    toast({
      title: "Order Placed Successfully",
      description: `Thank you! Your payment of $${amount.toFixed(2)} has been processed.`,
    });
  };

  return (
    <Card className="w-full shadow-none border border-border">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Payment Details</CardTitle>
        <CardDescription>Secure SSL Encrypted Transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input id="cardName" {...form.register("cardName")} placeholder="Jane Doe" />
            {form.formState.errors.cardName && <p className="text-destructive text-xs">{form.formState.errors.cardName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input id="cardNumber" {...form.register("cardNumber")} placeholder="0000 0000 0000 0000" />
              <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {form.formState.errors.cardNumber && <p className="text-destructive text-xs">{form.formState.errors.cardNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry (MM/YY)</Label>
              <Input id="expiry" {...form.register("expiry")} placeholder="MM/YY" />
              {form.formState.errors.expiry && <p className="text-destructive text-xs">{form.formState.errors.expiry.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" {...form.register("cvc")} placeholder="123" maxLength={4} />
              {form.formState.errors.cvc && <p className="text-destructive text-xs">{form.formState.errors.cvc.message}</p>}
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-between items-center font-serif text-lg">
            <span>Total</span>
            <span>${amount.toFixed(2)}</span>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground h-12 text-lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            {loading ? "Processing..." : "Pay Securely"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Payments processed securely via NMI Gateway. We do not store your card details.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
