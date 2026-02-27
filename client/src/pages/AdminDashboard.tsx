import { useState, useRef, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Upload, Link as LinkIcon, Image as ImageIcon, Eye, EyeOff, Key, Package, ChevronDown, ChevronUp, Truck, Mail, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteContent, updateSiteContent, updateAdminCredentials, uploadImage, fetchOrders, updateOrderStatus as apiUpdateOrderStatus, setAdminCredentials } from "@/lib/api";
import type { SiteContent, Order } from "@shared/schema";
import { SITE_CONTENT } from "@/lib/data";

function ImageUploadField({ label, value, onChange, onUpload, aspectHint }: { label: string; value: string; onChange: (url: string) => void; onUpload: () => void; aspectHint?: string }) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" className="pl-9" />
        </div>
        <Button variant="outline" onClick={onUpload} className="gap-2">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>
      {value ? (
        <div className={`${aspectHint === "wide" ? "h-32" : "h-40"} w-full bg-muted rounded-lg overflow-hidden border border-border`}>
          <img src={value} alt="Preview" className={`w-full h-full ${aspectHint === "contain" ? "object-contain p-2" : "object-cover"}`} />
        </div>
      ) : (
        <div className="h-24 w-full bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No image set</p>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-2">
      <h3 className="text-lg font-serif font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<{section: keyof SiteContent, field: string, index?: number} | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const { data: content, isLoading } = useQuery({
    queryKey: ["siteContent"],
    queryFn: fetchSiteContent,
    initialData: SITE_CONTENT,
  });

  const safeContent = content || SITE_CONTENT;
  const [localContent, setLocalContent] = useState<SiteContent>(safeContent);

  useEffect(() => {
    if (content) setLocalContent(content);
  }, [content]);

  const mutation = useMutation({
    mutationFn: updateSiteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      toast({ title: "Saved", description: "Website content updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" });
    },
  });

  const credentialsMutation = useMutation({
    mutationFn: () => updateAdminCredentials(currentUsername, currentPassword, newUsername, newPassword),
    onSuccess: () => {
      setAdminCredentials(newUsername, newPassword);
      toast({ title: "Credentials Updated", description: "Use your new credentials next time you log in." });
      setCurrentUsername(""); setCurrentPassword(""); setNewUsername(""); setNewPassword("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update credentials.", variant: "destructive" });
    },
  });

  const handleSave = () => mutation.mutate(localContent);

  const updateContent = (section: keyof SiteContent, field: string, value: string | number | any[], index?: number) => {
    setLocalContent(prev => {
      if (section === 'ritual' && index !== undefined && Array.isArray(prev.ritual.steps)) {
        const newSteps = [...prev.ritual.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        return { ...prev, ritual: { ...prev.ritual, steps: newSteps } };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const handleImageChange = (section: keyof SiteContent, field: string, url: string) => {
    setLocalContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: url } }));
  };

  const addGalleryImage = () => {
    setLocalContent(prev => ({ ...prev, product: { ...prev.product, images: [...(prev.product.images || []), ""] } }));
  };

  const removeGalleryImage = (index: number) => {
    setLocalContent(prev => ({ ...prev, product: { ...prev.product, images: prev.product.images.filter((_, i) => i !== index) } }));
  };

  const updateGalleryImage = (index: number, url: string) => {
    setLocalContent(prev => {
      const newImages = [...prev.product.images];
      newImages[index] = url;
      return { ...prev, product: { ...prev.product, images: newImages } };
    });
  };

  const triggerFileUpload = (section: keyof SiteContent, field: string, index?: number) => {
    setActiveUploadField({ section, field, index });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadField) {
      try {
        const result = await uploadImage(file);
        if (result.success && result.path) {
          if (activeUploadField.index !== undefined && activeUploadField.section === 'product') {
            updateGalleryImage(activeUploadField.index, result.path);
          } else {
            handleImageChange(activeUploadField.section, activeUploadField.field, result.path);
          }
          toast({ title: "Image Uploaded", description: "Image uploaded successfully." });
        }
      } catch {
        toast({ variant: "destructive", title: "Upload Failed", description: "Failed to upload image." });
      }
      setActiveUploadField(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4 border-b mb-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">PILIORA Admin</h1>
          <p className="text-sm text-muted-foreground">Manage your website content, images, and orders</p>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending} size="lg" className="bg-[#c9a962] text-white hover:bg-[#b8943f] gap-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <Tabs defaultValue="orders">
        <TabsList className="w-full grid grid-cols-5 h-12">
          <TabsTrigger value="orders" className="text-sm font-medium">Orders</TabsTrigger>
          <TabsTrigger value="product" className="text-sm font-medium">Product</TabsTrigger>
          <TabsTrigger value="homepage" className="text-sm font-medium">Homepage</TabsTrigger>
          <TabsTrigger value="story" className="text-sm font-medium">Our Story</TabsTrigger>
          <TabsTrigger value="settings" className="text-sm font-medium">Settings</TabsTrigger>
        </TabsList>

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        <TabsContent value="orders" className="mt-6">
          <AdminOrdersPanel />
        </TabsContent>

        {/* ═══════════════ PRODUCT TAB ═══════════════ */}
        <TabsContent value="product" className="space-y-6 mt-6">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-[#c9a962]" /> Product Info</CardTitle>
              <CardDescription>Name, price, volume, and purchase links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input value={localContent.product?.name || ""} onChange={(e) => updateContent('product', 'name', e.target.value)} placeholder="Piliora Pili Oil" />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" step="0.01" min="0" value={localContent.product?.price ?? ""} onChange={(e) => updateContent('product', 'price', parseFloat(e.target.value) || 0)} placeholder="85.00" />
                </div>
                <div className="space-y-2">
                  <Label>Volume</Label>
                  <Input value={localContent.product?.volume || ""} onChange={(e) => updateContent('product', 'volume', e.target.value)} placeholder="30ml / 1oz" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amazon Link</Label>
                <Input value={localContent.product?.amazonLink || ""} onChange={(e) => updateContent('product', 'amazonLink', e.target.value)} placeholder="https://www.amazon.com/dp/..." />
                <p className="text-xs text-muted-foreground">Used for all "Also on Amazon" buttons across the site</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[#c9a962]" /> Product Photos</CardTitle>
              <CardDescription>Main product image, lifestyle photo, and gallery images shown on the product page and in Quick Buy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUploadField
                  label="Main Product Image"
                  value={localContent.product.image}
                  onChange={(url) => handleImageChange('product', 'image', url)}
                  onUpload={() => triggerFileUpload('product', 'image')}
                  aspectHint="contain"
                />
                <ImageUploadField
                  label="Lifestyle Image"
                  value={localContent.product.lifestyleImage || ""}
                  onChange={(url) => handleImageChange('product', 'lifestyleImage', url)}
                  onUpload={() => triggerFileUpload('product', 'lifestyleImage')}
                />
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-sm font-medium">Gallery Images</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Additional product images shown in the product page carousel</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addGalleryImage} className="gap-1">
                    <Plus className="h-4 w-4" /> Add Image
                  </Button>
                </div>
                <div className="space-y-3">
                  {localContent.product.images && localContent.product.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border">
                        {img ? <img src={img} alt="Gallery" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 opacity-20" /></div>}
                      </div>
                      <Input value={img} onChange={(e) => updateGalleryImage(idx, e.target.value)} placeholder="Image URL" className="flex-1" />
                      <Button variant="outline" size="icon" onClick={() => triggerFileUpload('product', 'images', idx)} title="Upload"><Upload className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeGalleryImage(idx)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {(!localContent.product.images || localContent.product.images.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">No gallery images yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Text</CardTitle>
              <CardDescription>All text shown on the product page and Quick Buy drawer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={localContent.product?.tagline || ""} onChange={(e) => updateContent('product', 'tagline', e.target.value)} placeholder="Pili Oil from the Philippines" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={localContent.product?.subtitle || ""} onChange={(e) => updateContent('product', 'subtitle', e.target.value)} placeholder="The Essence of Moisturization" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea value={localContent.product?.description || ""} onChange={(e) => updateContent('product', 'description', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Quick Buy Description</Label>
                <Textarea value={localContent.product?.quickBuyDescription || ""} onChange={(e) => updateContent('product', 'quickBuyDescription', e.target.value)} rows={2} placeholder="Short description for the Quick Buy drawer" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Homepage Section Label</Label>
                  <Input value={localContent.product?.sectionLabel || ""} onChange={(e) => updateContent('product', 'sectionLabel', e.target.value)} placeholder="The Collection" />
                </div>
                <div className="space-y-2">
                  <Label>Shipping Note</Label>
                  <Input value={localContent.product?.shippingNote || ""} onChange={(e) => updateContent('product', 'shippingNote', e.target.value)} placeholder="Free shipping over $150" />
                </div>
                <div className="space-y-2">
                  <Label>Guarantee Note</Label>
                  <Input value={localContent.product?.guaranteeNote || ""} onChange={(e) => updateContent('product', 'guaranteeNote', e.target.value)} placeholder="30-day guarantee" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Benefits</CardTitle>
                  <CardDescription>Shown under the "Benefits" tab on the product page</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => { const items = [...(localContent.product?.benefits || []), { title: "", description: "" }]; updateContent('product', 'benefits', items); }} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(localContent.product?.benefits || []).map((item: { title: string; description: string }, idx: number) => (
                <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg">
                  <span className="bg-[#c9a962]/10 text-[#c9a962] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{idx + 1}</span>
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <Input placeholder="Title" value={item.title || ""} onChange={(e) => { const items = [...(localContent.product?.benefits || [])]; items[idx] = { ...items[idx], title: e.target.value }; updateContent('product', 'benefits', items); }} />
                    <div className="flex gap-2">
                      <Input placeholder="Description" value={item.description || ""} onChange={(e) => { const items = [...(localContent.product?.benefits || [])]; items[idx] = { ...items[idx], description: e.target.value }; updateContent('product', 'benefits', items); }} className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => { const items = [...(localContent.product?.benefits || [])]; items.splice(idx, 1); updateContent('product', 'benefits', items); }} className="text-destructive flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>Shown under the "Ingredients" tab on the product page</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => { const items = [...(localContent.product?.ingredients || []), ""]; updateContent('product', 'ingredients', items); }} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Intro Text</Label>
                <Input value={localContent.product?.ingredientsIntro || ""} onChange={(e) => updateContent('product', 'ingredientsIntro', e.target.value)} placeholder="Our formula is simple, pure, and effective." />
              </div>
              {(localContent.product?.ingredients || []).map((ing: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <Input value={ing} onChange={(e) => { const items = [...(localContent.product?.ingredients || [])]; items[idx] = e.target.value; updateContent('product', 'ingredients', items); }} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => { const items = [...(localContent.product?.ingredients || [])]; items.splice(idx, 1); updateContent('product', 'ingredients', items); }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
              <CardDescription>Shown under the "Usage" tab on the product page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Morning</Label>
                <Textarea value={localContent.product?.usageMorning || ""} onChange={(e) => updateContent('product', 'usageMorning', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Evening</Label>
                <Textarea value={localContent.product?.usageEvening || ""} onChange={(e) => updateContent('product', 'usageEvening', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Hair</Label>
                <Textarea value={localContent.product?.usageHair || ""} onChange={(e) => updateContent('product', 'usageHair', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ HOMEPAGE TAB ═══════════════ */}
        <TabsContent value="homepage" className="space-y-6 mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>The large banner at the top of the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input value={localContent.hero.headline} onChange={(e) => updateContent('hero', 'headline', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subtext</Label>
                <Textarea value={localContent.hero.subtext} onChange={(e) => updateContent('hero', 'subtext', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Origin Text (small text above headline)</Label>
                <Input value={localContent.hero.originText || ""} onChange={(e) => updateContent('hero', 'originText', e.target.value)} placeholder="Pili Oil from the Philippines" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shop Button Text</Label>
                  <Input value={localContent.hero.shopButtonText || ""} onChange={(e) => updateContent('hero', 'shopButtonText', e.target.value)} placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>Learn More Button Text</Label>
                  <Input value={localContent.hero.learnMoreButtonText || ""} onChange={(e) => updateContent('hero', 'learnMoreButtonText', e.target.value)} placeholder="Learn More" />
                </div>
              </div>
              <Separator />
              <SectionHeader title="Hero Images" />
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUploadField label="Background Image" value={localContent.hero.bgImage} onChange={(url) => handleImageChange('hero', 'bgImage', url)} onUpload={() => triggerFileUpload('hero', 'bgImage')} aspectHint="wide" />
                <ImageUploadField label="Bottle / Product Display" value={localContent.hero.bottleImage || ""} onChange={(url) => handleImageChange('hero', 'bottleImage', url)} onUpload={() => triggerFileUpload('hero', 'bottleImage')} aspectHint="contain" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Science Section</CardTitle>
              <CardDescription>"One Ingredient, Infinite Results" section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Label</Label>
                <Input value={localContent.science.sectionLabel || ""} onChange={(e) => updateContent('science', 'sectionLabel', e.target.value)} placeholder="The Science" />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={localContent.science.title} onChange={(e) => updateContent('science', 'title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={localContent.science.content} onChange={(e) => updateContent('science', 'content', e.target.value)} rows={4} />
              </div>
              <ImageUploadField label="Section Image" value={localContent.science.image} onChange={(url) => handleImageChange('science', 'image', url)} onUpload={() => triggerFileUpload('science', 'image')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Ritual</CardTitle>
              <CardDescription>The 3-step ritual section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Heading</Label>
                  <Input value={localContent.ritual.sectionHeading || ""} onChange={(e) => updateContent('ritual', 'sectionHeading', e.target.value)} placeholder="The Daily Ritual" />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input value={localContent.ritual.sectionSubheading || ""} onChange={(e) => updateContent('ritual', 'sectionSubheading', e.target.value)} placeholder="Elevate your routine" />
                </div>
              </div>
              <Separator />
              {localContent.ritual.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg">
                  <span className="bg-[#c9a962]/10 text-[#c9a962] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{idx + 1}</span>
                  <div className="flex-1 space-y-2">
                    <Input value={step.title} onChange={(e) => updateContent('ritual', 'title', e.target.value, idx)} placeholder="Step title" />
                    <Textarea value={step.text} onChange={(e) => updateContent('ritual', 'text', e.target.value, idx)} rows={2} placeholder="Step description" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
              <CardDescription>The "Power of Pili Oil" section with benefit cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.benefits?.label || ""} onChange={(e) => updateContent('benefits', 'label', e.target.value)} placeholder="Nature's Perfect Formula" />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={localContent.benefits?.heading || ""} onChange={(e) => updateContent('benefits', 'heading', e.target.value)} placeholder="The Power of Pili Oil" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={localContent.benefits?.subtitle || ""} onChange={(e) => updateContent('benefits', 'subtitle', e.target.value)} />
                </div>
              </div>
              <Separator />
              {(localContent.benefits?.items || []).map((item: { title: string; description: string }, idx: number) => (
                <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg">
                  <span className="bg-[#c9a962]/10 text-[#c9a962] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{idx + 1}</span>
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <Input placeholder="Title" value={item.title || ""} onChange={(e) => { const items = [...(localContent.benefits?.items || [])]; items[idx] = { ...items[idx], title: e.target.value }; updateContent('benefits', 'items', items); }} />
                    <Input placeholder="Description" value={item.description || ""} onChange={(e) => { const items = [...(localContent.benefits?.items || [])]; items[idx] = { ...items[idx], description: e.target.value }; updateContent('benefits', 'items', items); }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery Section</CardTitle>
              <CardDescription>Section headings for the image gallery on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.gallery?.label || ""} onChange={(e) => updateContent('gallery', 'label', e.target.value)} placeholder="The Experience" />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={localContent.gallery?.heading || ""} onChange={(e) => updateContent('gallery', 'heading', e.target.value)} placeholder="Luxury in Every Detail" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ OUR STORY TAB ═══════════════ */}
        <TabsContent value="story" className="space-y-6 mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Story Hero</CardTitle>
              <CardDescription>Top section of the Our Story page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.story?.heroLabel || ""} onChange={(e) => updateContent('story', 'heroLabel', e.target.value)} placeholder="Our Heritage" />
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input value={localContent.story?.heroHeadline || ""} onChange={(e) => updateContent('story', 'heroHeadline', e.target.value)} placeholder="The Tree of Hope" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Introduction</Label>
                <Textarea value={localContent.story?.heroIntro || ""} onChange={(e) => updateContent('story', 'heroIntro', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origin Section</CardTitle>
              <CardDescription>"Canarium Ovatum" — the origin story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.story?.originLabel || ""} onChange={(e) => updateContent('story', 'originLabel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={localContent.story?.originHeading || ""} onChange={(e) => updateContent('story', 'originHeading', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Paragraph 1</Label>
                <Textarea value={localContent.story?.originContent1 || ""} onChange={(e) => updateContent('story', 'originContent1', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Paragraph 2</Label>
                <Textarea value={localContent.story?.originContent2 || ""} onChange={(e) => updateContent('story', 'originContent2', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Paragraph 3</Label>
                <Textarea value={localContent.story?.originContent3 || ""} onChange={(e) => updateContent('story', 'originContent3', e.target.value)} rows={3} />
              </div>
              <ImageUploadField label="Origin Image" value={localContent.story?.originImage || ""} onChange={(url) => handleImageChange('story', 'originImage', url)} onUpload={() => triggerFileUpload('story', 'originImage')} />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region Title</Label>
                  <Input value={localContent.story?.originRegionTitle || ""} onChange={(e) => updateContent('story', 'originRegionTitle', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Region Subtitle</Label>
                  <Input value={localContent.story?.originRegionSubtitle || ""} onChange={(e) => updateContent('story', 'originRegionSubtitle', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Philosophy</CardTitle>
                  <CardDescription>"One Ingredient. Pure Intention."</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => { const items = [...(localContent.story?.philosophyItems || []), { title: "", description: "" }]; updateContent('story', 'philosophyItems', items); }} className="gap-1">
                  <Plus className="h-4 w-4" /> Add Pillar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.story?.philosophyLabel || ""} onChange={(e) => updateContent('story', 'philosophyLabel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={localContent.story?.philosophyHeading || ""} onChange={(e) => updateContent('story', 'philosophyHeading', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Introduction</Label>
                <Textarea value={localContent.story?.philosophyIntro || ""} onChange={(e) => updateContent('story', 'philosophyIntro', e.target.value)} rows={2} />
              </div>
              <Separator />
              {(localContent.story?.philosophyItems || []).map((item: { title: string; description: string }, idx: number) => (
                <div key={idx} className="flex gap-3 items-start p-3 border rounded-lg">
                  <span className="bg-[#c9a962]/10 text-[#c9a962] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{idx + 1}</span>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Pillar title" value={item.title || ""} onChange={(e) => { const items = [...(localContent.story?.philosophyItems || [])]; items[idx] = { ...items[idx], title: e.target.value }; updateContent('story', 'philosophyItems', items); }} />
                    <Textarea placeholder="Description" value={item.description || ""} onChange={(e) => { const items = [...(localContent.story?.philosophyItems || [])]; items[idx] = { ...items[idx], description: e.target.value }; updateContent('story', 'philosophyItems', items); }} rows={2} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { const items = [...(localContent.story?.philosophyItems || [])]; items.splice(idx, 1); updateContent('story', 'philosophyItems', items); }} className="text-destructive flex-shrink-0 mt-1"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commitment Section</CardTitle>
              <CardDescription>"Beauty That Gives Back"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input value={localContent.story?.commitmentLabel || ""} onChange={(e) => updateContent('story', 'commitmentLabel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={localContent.story?.commitmentHeading || ""} onChange={(e) => updateContent('story', 'commitmentHeading', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Paragraph 1</Label>
                <Textarea value={localContent.story?.commitmentContent1 || ""} onChange={(e) => updateContent('story', 'commitmentContent1', e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Paragraph 2</Label>
                <Textarea value={localContent.story?.commitmentContent2 || ""} onChange={(e) => updateContent('story', 'commitmentContent2', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ SETTINGS TAB ═══════════════ */}
        <TabsContent value="settings" className="space-y-6 mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Header</CardTitle>
              <CardDescription>Tagline and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Header Tagline</Label>
                  <Input value={localContent.layout?.headerTagline || ""} onChange={(e) => updateContent('layout', 'headerTagline', e.target.value)} placeholder="One ingredient. One ritual." />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Menu Tagline</Label>
                  <Input value={localContent.layout?.mobileMenuTagline || ""} onChange={(e) => updateContent('layout', 'mobileMenuTagline', e.target.value)} />
                </div>
              </div>
              <Separator />
              <SectionHeader title="Navigation Link Labels" />
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Home</Label>
                  <Input value={localContent.layout?.navHomeLabel || ""} onChange={(e) => updateContent('layout', 'navHomeLabel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Our Story</Label>
                  <Input value={localContent.layout?.navStoryLabel || ""} onChange={(e) => updateContent('layout', 'navStoryLabel', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>About (Footer)</Label>
                  <Input value={localContent.layout?.navAboutLabel || ""} onChange={(e) => updateContent('layout', 'navAboutLabel', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logos</CardTitle>
              <CardDescription>Footer and mobile menu logo images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <ImageUploadField label="Footer Logo" value={localContent.layout?.footerLogo || ""} onChange={(url) => handleImageChange('layout', 'footerLogo', url)} onUpload={() => triggerFileUpload('layout', 'footerLogo')} aspectHint="contain" />
                </div>
                <div className="space-y-3">
                  <ImageUploadField label="Mobile Menu Logo" value={localContent.layout?.mobileLogo || ""} onChange={(url) => handleImageChange('layout', 'mobileLogo', url)} onUpload={() => triggerFileUpload('layout', 'mobileLogo')} aspectHint="contain" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
              <CardDescription>Footer text and social links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Footer Description</Label>
                <Textarea value={localContent.layout?.footerDescription || ""} onChange={(e) => updateContent('layout', 'footerDescription', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input value={localContent.layout?.copyrightText || ""} onChange={(e) => updateContent('layout', 'copyrightText', e.target.value)} />
              </div>
              <Separator />
              <SectionHeader title="Social Media" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input value={localContent.layout?.instagramUrl || ""} onChange={(e) => updateContent('layout', 'instagramUrl', e.target.value)} placeholder="https://instagram.com/piliora" />
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input value={localContent.layout?.facebookUrl || ""} onChange={(e) => updateContent('layout', 'facebookUrl', e.target.value)} placeholder="https://facebook.com/piliora" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-[#c9a962]" />
                <div>
                  <CardTitle>Admin Login Credentials</CardTitle>
                  <CardDescription>Change your admin username and password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Username</Label>
                  <Input value={currentUsername} onChange={(e) => setCurrentUsername(e.target.value)} placeholder="Enter current username" data-testid="input-current-username" />
                </div>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="pr-10" data-testid="input-current-password" />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Username</Label>
                  <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Enter new username" data-testid="input-new-username" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="pr-10" data-testid="input-new-password" />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={() => credentialsMutation.mutate()} disabled={credentialsMutation.isPending || !currentUsername || !currentPassword || !newUsername || !newPassword} data-testid="button-update-credentials">
                {credentialsMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Credentials"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminOrdersPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, trackingNumber }: { id: number; status: string; trackingNumber?: string }) =>
      apiUpdateOrderStatus(id, status, trackingNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Order Updated", description: `Order #${variables.id} status changed to ${variables.status}. Customer notified.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order.", variant: "destructive" });
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    const trackingNumber = trackingInputs[orderId];
    statusMutation.mutate({ id: orderId, status: newStatus, trackingNumber: newStatus === "shipped" ? trackingNumber : undefined });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o: Order) => o.status === "pending").length,
    shipped: orders.filter((o: Order) => o.status === "shipped").length,
    revenue: orders.filter((o: Order) => o.status !== "cancelled").reduce((sum: number, o: Order) => sum + Number(o.totalAmount), 0),
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-2xl font-serif font-bold" data-testid="text-orders-total">{orderStats.total}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-serif font-bold text-yellow-600" data-testid="text-orders-pending">{orderStats.pending}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-serif font-bold text-purple-600" data-testid="text-orders-shipped">{orderStats.shipped}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Shipped</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-serif font-bold text-green-600" data-testid="text-orders-revenue">${orderStats.revenue.toFixed(2)}</p><p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p></CardContent></Card>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="py-16 text-center"><Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground font-light">No orders yet. They will appear here when customers place orders.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => (
            <Collapsible key={order.id} open={expandedOrder === order.id} onOpenChange={(open) => setExpandedOrder(open ? order.id : null)}>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-medium text-sm" data-testid={`text-order-id-${order.id}`}>Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden sm:inline" data-testid={`text-order-customer-${order.id}`}>{order.customerName}</span>
                        <span className="text-sm">${Number(order.totalAmount).toFixed(2)}</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`} data-testid={`badge-order-status-${order.id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 border-t pt-4 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Customer Info</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Name:</strong> {order.customerName}</p>
                          <p><strong>Email:</strong> {order.customerEmail}</p>
                          {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{order.shippingAddress}</p>
                          <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Order Details</h4>
                      <div className="bg-muted/50 p-4 rounded-md space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{order.productName} x {order.quantity}</span>
                          <span>${Number(order.unitPrice).toFixed(2)} each</span>
                        </div>
                        {order.subtotalAmount !== null && order.subtotalAmount !== undefined && (
                          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>${Number(order.subtotalAmount).toFixed(2)}</span></div>
                        )}
                        {order.shippingAmount !== null && order.shippingAmount !== undefined && (
                          <div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>{Number(order.shippingAmount) === 0 ? "Free" : `$${Number(order.shippingAmount).toFixed(2)}`}</span></div>
                        )}
                        {order.taxAmount !== null && order.taxAmount !== undefined && (
                          <div className="flex justify-between text-sm text-muted-foreground"><span>Tax</span><span>${Number(order.taxAmount).toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t"><span>Total</span><span>${Number(order.totalAmount).toFixed(2)}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs">Update Status</Label>
                        <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)} disabled={statusMutation.isPending}>
                          <SelectTrigger data-testid={`select-status-${order.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(order.status === "shipped" || order.status === "confirmed") && (
                        <div className="space-y-2 flex-1">
                          <Label className="text-xs">Tracking Number</Label>
                          <div className="flex gap-2">
                            <Input value={trackingInputs[order.id] || order.trackingNumber || ""} onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))} placeholder="Enter tracking number" className="flex-1" data-testid={`input-tracking-${order.id}`} />
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, "shipped")} disabled={statusMutation.isPending} data-testid={`button-ship-${order.id}`}>
                              {statusMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ship"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <div className="bg-purple-50 p-3 rounded-md"><p className="text-xs text-purple-600 font-medium">Tracking: {order.trackingNumber}</p></div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
