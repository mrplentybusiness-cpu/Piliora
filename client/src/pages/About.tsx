import { Leaf, Mountain, Heart, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteContent } from "@/lib/api";
import { SITE_CONTENT } from "@/lib/data";

const iconMap: Record<number, React.ElementType> = {
  0: Leaf,
  1: Heart,
  2: Droplets,
};

export default function About() {
  const { data: apiContent } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
  });

  const content = apiContent || SITE_CONTENT;
  const story = content.story || SITE_CONTENT.story;

  return (
    <div className="flex flex-col" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#f8f6f3] to-background overflow-hidden" aria-labelledby="about-hero-heading">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[#c9a962] text-xs font-medium tracking-[0.4em] uppercase mb-6 block" data-testid="text-about-heritage">
              {story.heroLabel}
            </span>
            <h1 id="about-hero-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-stone-800 mb-8 leading-tight" data-testid="text-about-headline">
              {story.heroHeadline}
            </h1>
            <p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto" data-testid="text-about-intro">
              {story.heroIntro}
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 md:py-32 bg-background" aria-labelledby="origin-heading">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#c9a962] text-xs font-bold tracking-[0.2em] uppercase mb-4 block" data-testid="text-origin-label">
                {story.originLabel}
              </span>
              <h2 id="origin-heading" className="font-serif text-3xl md:text-4xl text-stone-800 mb-6 leading-tight" data-testid="text-origin-heading">
                {story.originHeading}
              </h2>
              <p className="text-stone-600 leading-relaxed mb-6 font-light" data-testid="text-origin-content-1">
                {story.originContent1}
              </p>
              <p className="text-stone-600 leading-relaxed mb-6 font-light" data-testid="text-origin-content-2">
                {story.originContent2}
              </p>
              <p className="text-stone-600 leading-relaxed font-light" data-testid="text-origin-content-3">
                {story.originContent3}
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-amber-100 to-orange-50 rounded-none overflow-hidden" data-testid="img-origin-region">
                {story.originImage ? (
                  <img src={story.originImage} alt="Origin region" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mountain className="w-32 h-32 text-[#c9a962]/30" strokeWidth={1} aria-hidden="true" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/40 to-transparent">
                  <p className="text-white font-serif text-xl" data-testid="text-origin-region-title">{story.originRegionTitle}</p>
                  <p className="text-white/70 text-sm" data-testid="text-origin-region-subtitle">{story.originRegionSubtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 md:py-32 bg-[#1a1a1a]" aria-labelledby="philosophy-heading">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#c9a962] text-xs font-medium tracking-[0.4em] uppercase mb-4 block" data-testid="text-philosophy-label">
              {story.philosophyLabel}
            </span>
            <h2 id="philosophy-heading" className="font-serif text-3xl md:text-4xl text-white mb-6" data-testid="text-philosophy-heading">
              {story.philosophyHeading}
            </h2>
            <p className="text-white/60 font-light max-w-2xl mx-auto leading-relaxed" data-testid="text-philosophy-intro">
              {story.philosophyIntro}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" data-testid="philosophy-grid">
            {(story.philosophyItems || SITE_CONTENT.story.philosophyItems).map((item, idx) => {
              const IconComponent = iconMap[idx] || Leaf;
              return (
                <div
                  key={idx}
                  className="text-center p-8 border border-[#c9a962]/20 bg-[#c9a962]/5"
                  data-testid={`card-philosophy-${idx}`}
                >
                  <IconComponent className="w-10 h-10 text-[#c9a962] mx-auto mb-6" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="font-serif text-xl text-white mb-4" data-testid={`text-philosophy-title-${idx}`}>{item.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed text-sm" data-testid={`text-philosophy-desc-${idx}`}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-20 md:py-32 bg-background" aria-labelledby="commitment-heading">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div>
              <span className="text-[#c9a962] text-xs font-medium tracking-[0.4em] uppercase mb-4 block" data-testid="text-commitment-label">
                {story.commitmentLabel}
              </span>
              <h2 id="commitment-heading" className="font-serif text-3xl md:text-4xl text-stone-800 mb-8" data-testid="text-commitment-heading">
                {story.commitmentHeading}
              </h2>
              <p className="text-stone-600 font-light leading-relaxed mb-6" data-testid="text-commitment-content-1">
                {story.commitmentContent1}
              </p>
              <p className="text-stone-600 font-light leading-relaxed" data-testid="text-commitment-content-2">
                {story.commitmentContent2}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
