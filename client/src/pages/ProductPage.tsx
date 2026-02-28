import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, Minus, Plus, ShoppingBag, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "@/lib/api";
import { SITE_CONTENT } from "@/lib/data";
import productPhotoFallback from "@assets/Piliora_Product_Photo_1772210910474.JPG";

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [, setLocation] = useLocation();

  const { data: apiContent } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
    placeholderData: SITE_CONTENT,
  });

  const content = apiContent || SITE_CONTENT;
  const product = content.product || SITE_CONTENT.product;
  const primaryImage = product.image || productPhotoFallback;
  const allImages = [primaryImage, ...(product.images || []).filter((img: string) => img !== product.image)];

  const productBenefits = product.benefits || SITE_CONTENT.product.benefits;
  const productIngredients = product.ingredients || SITE_CONTENT.product.ingredients;

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  const handleBuyNow = () => {
    setLocation(`/checkout?qty=${quantity}`);
  };

  return (
    <div className="pt-8 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center text-sm text-muted-foreground mb-8" data-testid="breadcrumbs">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="aspect-[4/5] w-full bg-white relative overflow-hidden border border-border/30">
              <img
                src={allImages[selectedImage] || primaryImage}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                data-testid="img-product-main"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-white border ${selectedImage === idx ? 'border-stone-800 ring-1 ring-stone-800' : 'border-border/50'} hover:border-stone-600 transition-colors overflow-hidden`}
                    data-testid={`button-thumbnail-${idx}`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-[#c9a962] text-xs font-medium tracking-[0.3em] uppercase mb-2 block" data-testid="text-product-badge">{product.tagline || SITE_CONTENT.product.tagline}</span>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-2" data-testid="text-product-name">{product.name}</h1>
            <p className="text-lg text-stone-500 italic mb-6 font-light">{product.subtitle || SITE_CONTENT.product.subtitle}</p>

            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-light text-stone-800" data-testid="text-product-price">${product.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-stone-400 mb-8" data-testid="text-product-volume">{product.volume || SITE_CONTENT.product.volume}</p>

            <p className="text-stone-500 leading-relaxed mb-8 font-light" data-testid="text-product-description">
              {product.description || SITE_CONTENT.product.description}
            </p>

            <Separator className="mb-8" />

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center border border-stone-200 w-fit">
                <button onClick={decrement} className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors" data-testid="button-quantity-minus">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium" data-testid="text-quantity">{quantity}</span>
                <button onClick={increment} className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors" data-testid="button-quantity-plus">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleBuyNow}
                className="flex-1 h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-none text-sm tracking-[0.15em] uppercase"
                data-testid="button-buy-now"
              >
                Buy Now — ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>

            {product.amazonLink && product.amazonLink !== "" && (
              <a
                href={product.amazonLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-[#c9a962] hover:text-[#e0c47a] transition-colors mb-8"
                data-testid="link-product-amazon"
              >
                <ShoppingBag className="w-4 h-4" />
                Also available on Amazon
              </a>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-stone-500 mb-10">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-stone-700" />
                <span>{product.shippingNote || SITE_CONTENT.product.shippingNote}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-stone-700" />
                <span>{product.guaranteeNote || SITE_CONTENT.product.guaranteeNote}</span>
              </div>
            </div>

            <Tabs defaultValue="benefits">
              <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none h-auto p-0">
                <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-800 data-[state=active]:bg-transparent py-3 font-serif text-lg" data-testid="tab-benefits">Benefits</TabsTrigger>
                <TabsTrigger value="ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-800 data-[state=active]:bg-transparent py-3 font-serif text-lg" data-testid="tab-ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="usage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-stone-800 data-[state=active]:bg-transparent py-3 font-serif text-lg" data-testid="tab-usage">Usage</TabsTrigger>
              </TabsList>
              <TabsContent value="benefits" className="pt-6">
                <ul className="space-y-4">
                  {productBenefits.map((b: { title: string; description: string }, i: number) => (
                    <li key={i} className="flex gap-4" data-testid={`benefit-item-${i}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c9a962] mt-2 flex-shrink-0"></div>
                      <div>
                        <strong className="block text-stone-800 font-serif">{b.title}</strong>
                        <span className="text-stone-500 font-light">{b.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="ingredients" className="pt-6">
                <p className="mb-4 text-stone-500 font-light">{product.ingredientsIntro || SITE_CONTENT.product.ingredientsIntro}</p>
                <ul className="space-y-2">
                  {productIngredients.map((ing: string, i: number) => (
                    <li key={i} className="pb-2 border-b border-border last:border-0 text-stone-700" data-testid={`ingredient-${i}`}>
                      {ing}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="usage" className="pt-6">
                <div className="space-y-4 text-stone-500 font-light">
                  <p><strong className="text-stone-700">Morning:</strong> {product.usageMorning || SITE_CONTENT.product.usageMorning}</p>
                  <p><strong className="text-stone-700">Evening:</strong> {product.usageEvening || SITE_CONTENT.product.usageEvening}</p>
                  <p><strong className="text-stone-700">Hair:</strong> {product.usageHair || SITE_CONTENT.product.usageHair}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
