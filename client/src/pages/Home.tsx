import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ExternalLink, ChevronDown, Droplets, Shield, Sparkles, Leaf, Sun, Heart, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { FullPageSkeleton } from "@/components/LoadingSkeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "@/lib/api";
import { SITE_CONTENT } from "@/lib/data";
import productPhoto from "@assets/Piliora_Product_Photo_1772210910474.JPG";

export default function Home() {
  const [, setLocation] = useLocation();
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { data: apiContent, isLoading } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
    placeholderData: SITE_CONTENT,
    staleTime: 1000 * 60 * 5,
  });

  const content = apiContent || SITE_CONTENT;
  const benefits = content.benefits || SITE_CONTENT.benefits;
  const gallery = content.gallery || SITE_CONTENT.gallery;

  if (isLoading && !content) {
    return <FullPageSkeleton />;
  }

  const handleBuyNow = () => {
    setQuickBuyOpen(false);
    setLocation(`/checkout?qty=${quantity}`);
  };

  return (
    <div className="flex flex-col">
      {/* Quick Buy Drawer */}
      <Sheet open={quickBuyOpen} onOpenChange={setQuickBuyOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px] bg-white p-0 flex flex-col">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="font-serif text-2xl text-stone-800">Quick Buy</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="aspect-[3/4] w-full bg-[#f8f6f3] overflow-hidden mb-6">
              <img
                src={productPhoto}
                alt={content.product.name}
                className="w-full h-full object-contain p-4"
                data-testid="img-quick-buy-product"
              />
            </div>

            <span className="text-[#c9a962] text-[10px] tracking-[0.3em] uppercase block mb-1">Pili Oil from the Philippines</span>
            <h3 className="font-serif text-2xl text-stone-800 mb-1" data-testid="text-quick-buy-name">{content.product.name}</h3>
            <p className="text-xl font-light text-stone-600 mb-6" data-testid="text-quick-buy-price">${content.product.price.toFixed(2)}</p>

            <p className="text-sm text-stone-500 font-light leading-relaxed mb-6">
              100% pure, cold-pressed Pili Oil. A single-ingredient luxury for face, neck, and hair.
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-stone-600 uppercase tracking-wider">Qty</span>
              <div className="flex items-center border border-stone-200">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  data-testid="button-quick-buy-minus"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center text-sm font-medium" data-testid="text-quick-buy-qty">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  data-testid="button-quick-buy-plus"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="flex justify-between items-center mb-6 font-serif text-lg">
              <span className="text-stone-600">Total</span>
              <span className="text-stone-800" data-testid="text-quick-buy-total">${(content.product.price * quantity).toFixed(2)}</span>
            </div>

            <Button
              onClick={handleBuyNow}
              className="w-full bg-stone-900 text-white hover:bg-stone-800 rounded-none h-14 text-sm tracking-[0.15em] uppercase mb-3"
              data-testid="button-quick-buy-checkout"
            >
              Proceed to Checkout
            </Button>

            <a
              href={content.product.amazonLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-[#c9a962] hover:text-[#e0c47a] transition-colors py-2"
              data-testid="link-quick-buy-amazon"
            >
              <ShoppingBag className="w-3 h-3" />
              Also available on Amazon
            </a>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hero Section - Product as Star */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f8f6f3] via-[#faf9f7] to-[#f5f3f0]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-amber-100/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full bg-orange-100/30 blur-3xl"
            aria-hidden="true"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 lg:py-0">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[90vh] lg:min-h-[85vh]">

            <div className="order-1 lg:order-2 flex justify-center items-center relative pt-16 pb-4 lg:pt-0 lg:pb-0">
              <div
                className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] rounded-full bg-gradient-to-br from-amber-200/50 via-orange-100/30 to-transparent blur-2xl"
                aria-hidden="true"
              />

              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div
                  className="absolute -bottom-8 sm:-bottom-10 lg:-bottom-12 left-1/2 -translate-x-1/2 w-40 sm:w-48 lg:w-56 h-6 sm:h-8 lg:h-10 bg-stone-900/15 rounded-full blur-xl"
                  aria-hidden="true"
                />

                <img
                  src={content.hero.bottleImage || "/bottle-hero.png"}
                  alt="PILIORA Pili Oil Bottle - Premium organic moisturizer from the Philippines"
                  className="w-[380px] sm:w-[460px] md:w-[560px] lg:w-[650px] xl:w-[720px] h-auto max-h-[72vh] sm:max-h-[82vh] lg:max-h-[90vh] object-contain"
                  style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.18))" }}
                  data-testid="img-hero-bottle"
                />
              </motion.div>

              <div
                className="hidden sm:block absolute top-10 right-10 w-3 h-3 bg-amber-400/60 rounded-full"
                aria-hidden="true"
              />
              <div
                className="hidden sm:block absolute bottom-20 left-5 w-2 h-2 bg-orange-300/50 rounded-full"
                aria-hidden="true"
              />
            </div>

            <div className="order-2 lg:order-1 text-center lg:text-left pb-8 lg:pb-0">
              <span
                className="block text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 text-amber-700/70"
                data-testid="text-hero-origin"
              >
                Pili Oil from the Philippines
              </span>

              <h1
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.15] mb-5 sm:mb-8 text-stone-800"
                data-testid="text-hero-headline"
              >
                {content.hero.headline}
              </h1>

              <p
                className="text-sm sm:text-base md:text-lg font-light text-stone-600 mb-8 sm:mb-10 max-w-md sm:max-w-lg mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0"
                data-testid="text-hero-subtext"
              >
                {content.hero.subtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                <RippleButton
                  size="lg"
                  onClick={() => setQuickBuyOpen(true)}
                  className="w-full sm:w-auto bg-stone-900 text-white hover:bg-stone-800 rounded-none px-8 sm:px-10 h-12 sm:h-14 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-500 shadow-lg hover:shadow-xl"
                  data-testid="button-hero-shop"
                >
                  Shop Now
                </RippleButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-none px-8 sm:px-10 h-12 sm:h-14 text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase border-stone-300 text-stone-700 hover:bg-stone-100 transition-all duration-500"
                  onClick={() => document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="button-hero-learn-more"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-stone-400 cursor-pointer"
            onClick={() => document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' })}
            role="button"
            aria-label="Scroll to content"
            data-testid="button-scroll-indicator"
          >
            <ChevronDown className="w-6 h-6" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* The Science: One Ingredient, Infinite Results */}
      <section id="science" className="py-32 bg-background" aria-labelledby="science-heading">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={content.science.image}
                alt="Close-up of pure Pili Oil showcasing its golden color and luxurious texture"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                data-testid="img-science"
              />
            </div>
            <div>
              <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block" data-testid="text-science-label">The Science</span>
              <h2 id="science-heading" className="font-serif text-4xl md:text-5xl text-primary mb-8 leading-tight" data-testid="text-science-title">
                {content.science.title}
              </h2>
              <div className="w-16 h-[1px] bg-primary/20 mb-8" aria-hidden="true"></div>
              <p className="text-muted-foreground text-lg leading-loose font-light" data-testid="text-science-content">
                {content.science.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Benefits Section */}
      <section className="py-32 bg-[#1a1a1a]" aria-labelledby="benefits-heading">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-[#c9a962] text-xs font-medium tracking-[0.4em] uppercase mb-4 block" data-testid="text-benefits-label">
              {benefits.label}
            </span>
            <h2 id="benefits-heading" className="font-serif text-3xl md:text-5xl text-white mb-6" data-testid="text-benefits-heading">
              {benefits.heading}
            </h2>
            <p className="text-white/60 font-light max-w-2xl mx-auto leading-relaxed" data-testid="text-benefits-intro">
              {benefits.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {(benefits.items || SITE_CONTENT.benefits.items).map((benefit, idx) => {
              const icons = [Droplets, Shield, Sparkles, Leaf, Sun, Heart];
              const IconComponent = icons[idx % icons.length];
              return (
                <article
                  key={idx}
                  className="p-6 lg:p-8 border border-[#c9a962]/20 bg-[#c9a962]/5 hover:bg-[#c9a962]/10 transition-colors duration-300"
                  role="article"
                  aria-labelledby={`benefit-${idx}-title`}
                  data-testid={`card-benefit-${idx}`}
                >
                  <IconComponent className="w-8 h-8 text-[#c9a962] mb-6" strokeWidth={1.5} aria-hidden="true" />
                  <h3 id={`benefit-${idx}-title`} className="font-serif text-xl text-white mb-3" data-testid={`text-benefit-title-${idx}`}>{benefit.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed text-sm" data-testid={`text-benefit-desc-${idx}`}>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-32 bg-gradient-to-b from-background to-[#f8f6f3]" aria-labelledby="gallery-heading">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#c9a962] text-xs font-medium tracking-[0.4em] uppercase mb-4 block" data-testid="text-gallery-label">
              {gallery.label}
            </span>
            <h2 id="gallery-heading" className="font-serif text-3xl md:text-5xl text-stone-800 mb-6" data-testid="text-gallery-heading">
              {gallery.heading}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="gallery-grid">
            {content.product.images && content.product.images.length > 0 ? (
              content.product.images.slice(0, 5).map((img, idx) => {
                const aspects = [
                  "aspect-square",
                  "aspect-[4/5] md:row-span-2",
                  "aspect-square",
                  "aspect-square",
                  "aspect-square md:col-span-2"
                ];
                return (
                  <div
                    key={idx}
                    data-testid={`gallery-item-${idx}`}
                    className={`${aspects[idx] || "aspect-square"} bg-gradient-to-br from-amber-100 to-orange-50 overflow-hidden group`}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={`PILIORA product gallery image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100">
                        <Sparkles className="w-8 h-8 text-[#c9a962]/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-stone-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
                <p className="font-light">Gallery images coming soon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Ritual: 3 Column Layout */}
      <section className="py-32 bg-secondary/30" aria-labelledby="ritual-heading">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 id="ritual-heading" className="font-serif text-4xl md:text-5xl text-primary mb-6" data-testid="text-ritual-heading">The Daily Ritual</h2>
            <p className="text-muted-foreground font-light tracking-wide uppercase text-sm" data-testid="text-ritual-subheading">Elevate your routine</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12" data-testid="ritual-steps-grid">
            {content.ritual.steps.map((step, idx) => (
              <div
                key={idx}
                className="text-center group"
                data-testid={`card-ritual-step-${idx + 1}`}
              >
                <div className="mb-8 relative inline-block">
                  <span className="font-serif text-8xl text-primary/5 group-hover:text-accent/20 transition-colors duration-500" aria-hidden="true">
                    0{idx + 1}
                  </span>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-primary/20" aria-hidden="true"></div>
                </div>
                <h3 className="font-serif text-2xl mb-4 text-primary" data-testid={`text-ritual-step-title-${idx + 1}`}>{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed px-4 font-light" data-testid={`text-ritual-step-desc-${idx + 1}`}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlight / Purchase Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-card p-8 md:p-16 shadow-2xl border border-border/50 text-center">
             <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 text-left">
                  <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4 block" data-testid="text-product-label">The Collection</span>
                  <h2 className="font-serif text-4xl mb-6" data-testid="text-product-name">{content.product.name}</h2>
                  <p className="text-2xl font-light text-primary mb-8" data-testid="text-product-price">${content.product.price.toFixed(2)}</p>

                  <RippleButton
                    onClick={() => setQuickBuyOpen(true)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-14 text-sm tracking-[0.2em] uppercase mb-3"
                    data-testid="button-product-buy"
                  >
                    Buy Now
                  </RippleButton>
                  <a
                    href={content.product.amazonLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-xs text-[#c9a962] hover:text-[#e0c47a] transition-colors py-2"
                    data-testid="link-product-amazon"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Also available on Amazon
                  </a>
                </div>
                <div className="order-1 md:order-2 flex justify-center">
                   <div className="relative w-64 sm:w-72 md:w-80 lg:w-96">
                      <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
                      <img src={content.hero.bottleImage || "/bottle-hero.png"} alt="PILIORA Pili Oil product bottle" className="relative z-10 w-full drop-shadow-xl" data-testid="img-product-bottle" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
