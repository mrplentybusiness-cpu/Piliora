import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Minus, Plus, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ASSETS, PRODUCT } from "@/lib/data";

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="pt-8 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-primary">Shop</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span>{PRODUCT.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] w-full bg-white relative overflow-hidden rounded-sm border border-border/50">
              <img 
                src={PRODUCT.images[selectedImage]} 
                alt={PRODUCT.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {PRODUCT.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-white border ${selectedImage === idx ? 'border-primary ring-1 ring-primary' : 'border-border'} hover:border-primary transition-colors`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-2 text-accent font-medium tracking-wide uppercase text-sm">Best Seller</div>
            <h1 className="font-serif text-4xl md:text-5xl text-primary mb-2">{PRODUCT.name}</h1>
            <p className="text-lg text-muted-foreground italic mb-6">{PRODUCT.subtitle}</p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-light text-primary">${PRODUCT.price.toFixed(2)}</span>
              <div className="flex items-center text-yellow-500 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <span className="text-muted-foreground ml-2">(128 Reviews)</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {PRODUCT.description}
            </p>

            <Separator className="mb-8" />

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-input w-fit">
                <button onClick={decrement} className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={increment} className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Buy Now Dialog / Add to Cart */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1 h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-wider">
                    Add to Cart - ${(PRODUCT.price * quantity).toFixed(2)}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <CheckoutForm amount={PRODUCT.price * quantity} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-10">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>30-day money back guarantee</span>
              </div>
            </div>

            <Tabs defaultValue="benefits">
              <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none h-auto p-0">
                <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-serif text-lg">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-serif text-lg">Ingredients</TabsTrigger>
                <TabsTrigger value="usage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-serif text-lg">Usage</TabsTrigger>
              </TabsList>
              <TabsContent value="benefits" className="pt-6">
                <ul className="space-y-4">
                  {PRODUCT.benefits.map((b, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                      <div>
                        <strong className="block text-primary font-serif">{b.title}</strong>
                        <span className="text-muted-foreground">{b.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="ingredients" className="pt-6">
                <p className="mb-4 text-muted-foreground">Our formula is simple, pure, and effective.</p>
                <ul className="space-y-2">
                  {PRODUCT.ingredients.map((ing, i) => (
                    <li key={i} className="pb-2 border-b border-border last:border-0 flex justify-between">
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="usage" className="pt-6">
                <div className="space-y-4 text-muted-foreground">
                  <p><strong>Morning:</strong> Apply 2-3 drops to clean, damp skin. Massage gently in upward motions.</p>
                  <p><strong>Evening:</strong> Use as the final step in your skincare routine to lock in moisture.</p>
                  <p><strong>Hair:</strong> Rub 1-2 drops between palms and smooth over frizzy ends.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
