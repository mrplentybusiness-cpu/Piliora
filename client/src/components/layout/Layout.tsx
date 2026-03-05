import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, User, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BackToTop } from "@/components/BackToTop";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "@/lib/api";
import { SITE_CONTENT } from "@/lib/data";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: apiContent } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
  });

  const content = apiContent || SITE_CONTENT;
  const layout = content.layout || SITE_CONTENT.layout;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#c9a962] focus:text-white focus:rounded" data-testid="link-skip-to-content">
        Skip to main content
      </a>
      
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border/20 transition-all duration-300" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-6 h-40 md:h-48 lg:h-56 flex items-center justify-between">
          
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground" data-testid="button-mobile-menu" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#1a1a1a] border-[#c9a962]/20">
                <SheetHeader>
                  <SheetTitle className="text-left mt-4">
                    <img src={layout.mobileLogo || "/logo-footer.png"} alt="PILIORA" className="h-14 w-auto" data-testid="img-mobile-menu-logo" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-8 mt-12 pl-2">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-light text-[#c9a962] hover:text-[#e0c47a] transition-colors" data-testid="link-mobile-home">{layout.navHomeLabel}</Link>
                  <Link href="/product" onClick={() => setMobileMenuOpen(false)} className="text-xl font-light text-[#c9a962] hover:text-[#e0c47a] transition-colors" data-testid="link-mobile-shop">Shop</Link>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-xl font-light text-[#c9a962] hover:text-[#e0c47a] transition-colors" data-testid="link-mobile-about">{layout.navStoryLabel}</Link>
                </div>
                <div className="absolute bottom-8 left-6 right-6">
                  <p className="text-[#c9a962]/50 text-xs tracking-wider" data-testid="text-mobile-menu-tagline">{layout.mobileMenuTagline}</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link href="/" data-testid="link-logo">
              <span 
                className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.15em] text-stone-800 cursor-pointer inline-block font-light"
                data-testid="text-logo"
              >
                {layout.headerTagline}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center gap-12">
            <Link href="/" data-testid="link-nav-home"><span className={`text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors cursor-pointer ${location === '/' ? 'text-accent' : ''}`}>{layout.navHomeLabel}</span></Link>
            <Link href="/product" data-testid="link-nav-shop"><span className={`text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors cursor-pointer ${location === '/product' ? 'text-accent' : ''}`}>Shop</span></Link>
            <Link href="/about" data-testid="link-nav-about"><span className={`text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors cursor-pointer ${location === '/about' ? 'text-accent' : ''}`}>{layout.navStoryLabel}</span></Link>
          </div>

          <div className="flex items-center gap-4">
             {layout.instagramUrl && <a href={layout.instagramUrl} target="_blank" rel="noopener noreferrer" className="hidden md:block text-foreground hover:text-accent transition-colors" data-testid="link-nav-instagram" aria-label="Visit PILIORA on Instagram"><Instagram className="w-4 h-4" aria-hidden="true" /></a>}
             <Link href="/admin/login" data-testid="link-nav-admin">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-accent" data-testid="button-admin" aria-label="Admin login">
                <User className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="pt-40 md:pt-48 lg:pt-56" role="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="bg-[#1a1a1a] py-24" role="contentinfo" aria-label="Site footer">
        <div className="container mx-auto px-6 text-center">
          <img src={layout.footerLogo || "/logo-footer.png"} alt="PILIORA - Premium Pili Oil Skincare" className="h-24 w-auto mx-auto mb-8" data-testid="img-footer-logo" />
          
          <div className="flex justify-center gap-8 mb-12">
            <Link href="/" className="text-[#c9a962] text-xs uppercase tracking-widest hover:text-[#e0c47a] transition-colors" data-testid="link-footer-home">{layout.navHomeLabel}</Link>
            <Link href="/product" className="text-[#c9a962] text-xs uppercase tracking-widest hover:text-[#e0c47a] transition-colors" data-testid="link-footer-shop">Shop</Link>
            <Link href="/about" className="text-[#c9a962] text-xs uppercase tracking-widest hover:text-[#e0c47a] transition-colors" data-testid="link-footer-about">{layout.navAboutLabel}</Link>
            <Link href="/admin/login" className="text-[#c9a962] text-xs uppercase tracking-widest hover:text-[#e0c47a] transition-colors" data-testid="link-footer-admin">Admin</Link>
          </div>

          <div className="max-w-md mx-auto mb-12 text-[#c9a962]/70 font-light leading-relaxed" data-testid="text-footer-description">
            {layout.footerDescription}
          </div>

          {(layout.instagramUrl || layout.facebookUrl) && (
            <div className="flex justify-center gap-6 mb-12" role="navigation" aria-label="Social media links">
              {layout.instagramUrl && (
                <a href={layout.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow PILIORA on Instagram" data-testid="link-footer-instagram">
                  <Instagram className="w-5 h-5 text-[#c9a962] opacity-60 hover:opacity-100 cursor-pointer" aria-hidden="true" />
                </a>
              )}
              {layout.facebookUrl && (
                <a href={layout.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow PILIORA on Facebook" data-testid="link-footer-facebook">
                  <Facebook className="w-5 h-5 text-[#c9a962] opacity-60 hover:opacity-100 cursor-pointer" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          <div className="text-[10px] text-[#c9a962]/40 uppercase tracking-widest mb-4">
            © {new Date().getFullYear()} {layout.copyrightText}
          </div>

          <div className="text-[10px] text-[#c9a962]/30 tracking-wider" data-testid="text-footer-credit">
            Built by{" "}
            <a
              href="https://www.PlentyWebDesign.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a962]/50 hover:text-[#c9a962]/80 transition-colors underline underline-offset-2"
              data-testid="link-footer-credit"
            >
              Plenty Web Design
            </a>
          </div>
        </div>
      </footer>
      
      <BackToTop />
    </div>
  );
}
