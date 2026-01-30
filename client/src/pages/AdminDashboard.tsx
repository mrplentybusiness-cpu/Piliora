import { useState, useRef, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Upload, Link as LinkIcon, Image as ImageIcon, Eye, EyeOff, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteContent, updateSiteContent, updateAdminCredentials, uploadImage } from "@/lib/api";
import type { SiteContent } from "@shared/schema";
import { SITE_CONTENT } from "@/lib/data";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<{section: keyof SiteContent, field: string, index?: number} | null>(null);
  
  // Credentials form state
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
    if (content) {
      setLocalContent(content);
    }
  }, [content]);

  const mutation = useMutation({
    mutationFn: updateSiteContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
      toast({
        title: "Settings Saved",
        description: "Website content has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const credentialsMutation = useMutation({
    mutationFn: () => updateAdminCredentials(currentUsername, currentPassword, newUsername, newPassword),
    onSuccess: () => {
      toast({
        title: "Credentials Updated",
        description: "Your login credentials have been changed successfully. Please use the new credentials next time you log in.",
      });
      setCurrentUsername("");
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update credentials.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    mutation.mutate(localContent);
  };

  const updateContent = (section: keyof SiteContent, field: string, value: string | any[], index?: number) => {
    setLocalContent(prev => {
      if (section === 'ritual' && index !== undefined && Array.isArray(prev.ritual.steps)) {
        const newSteps = [...prev.ritual.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        return { ...prev, ritual: { ...prev.ritual, steps: newSteps } };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleImageChange = (section: keyof SiteContent, field: string, url: string) => {
    setLocalContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: url
      }
    }));
  };

  const addGalleryImage = () => {
    setLocalContent(prev => ({
      ...prev,
      product: {
        ...prev.product,
        images: [...(prev.product.images || []), ""]
      }
    }));
  };

  const removeGalleryImage = (index: number) => {
    setLocalContent(prev => ({
      ...prev,
      product: {
        ...prev.product,
        images: prev.product.images.filter((_, i) => i !== index)
      }
    }));
  };

  const updateGalleryImage = (index: number, url: string) => {
    setLocalContent(prev => {
      const newImages = [...prev.product.images];
      newImages[index] = url;
      return {
        ...prev,
        product: {
          ...prev.product,
          images: newImages
        }
      };
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
          toast({
            title: "Image Uploaded",
            description: "Image uploaded successfully.",
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
        });
      }
      setActiveUploadField(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Content Management</h1>
          <p className="text-muted-foreground">Manage your website text and images.</p>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending} className="bg-primary text-primary-foreground">
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <Tabs defaultValue="images">
        <TabsList className="w-full flex flex-wrap gap-1">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="science">Science</TabsTrigger>
          <TabsTrigger value="ritual">Ritual</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="story">Our Story</TabsTrigger>
          <TabsTrigger value="layout">Header/Footer</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-6 mt-6">
          <Card>
             <CardHeader>
               <CardTitle>Core Imagery</CardTitle>
               <CardDescription>Update the main images used across the site sections.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-8">
               <div className="space-y-3">
                 <Label>Hero Background Image</Label>
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={localContent.hero.bgImage} 
                        onChange={(e) => handleImageChange('hero', 'bgImage', e.target.value)}
                        placeholder="https://example.com/hero.jpg"
                        className="pl-9"
                      />
                    </div>
                    <Button variant="outline" onClick={() => triggerFileUpload('hero', 'bgImage')}>
                       <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                 </div>
                 <div className="h-32 w-full bg-muted rounded overflow-hidden border border-border">
                    <img src={localContent.hero.bgImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
                 </div>
               </div>

               <div className="space-y-3">
                 <Label>Hero Bottle Image (Main Product Display)</Label>
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={localContent.hero.bottleImage || ""} 
                        onChange={(e) => handleImageChange('hero', 'bottleImage', e.target.value)}
                        placeholder="https://example.com/bottle.jpg"
                        className="pl-9"
                      />
                    </div>
                    <Button variant="outline" onClick={() => triggerFileUpload('hero', 'bottleImage')}>
                       <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                 </div>
                 <div className="h-32 w-full bg-muted rounded overflow-hidden border border-border">
                    <img src={localContent.hero.bottleImage || "/bottle-hero.png"} alt="Preview" className="w-full h-full object-contain p-2" />
                 </div>
               </div>
               
               <div className="space-y-3">
                 <Label>Science Section Image</Label>
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={localContent.science.image} 
                        onChange={(e) => handleImageChange('science', 'image', e.target.value)}
                        placeholder="https://example.com/science.jpg"
                        className="pl-9"
                      />
                    </div>
                    <Button variant="outline" onClick={() => triggerFileUpload('science', 'image')}>
                       <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                 </div>
                 <div className="h-32 w-full bg-muted rounded overflow-hidden border border-border">
                    <img src={localContent.science.image} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               </div>

               <div className="space-y-3">
                 <Label>Product Main Image</Label>
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={localContent.product.image} 
                        onChange={(e) => handleImageChange('product', 'image', e.target.value)}
                        placeholder="https://example.com/product.jpg"
                        className="pl-9"
                      />
                    </div>
                    <Button variant="outline" onClick={() => triggerFileUpload('product', 'image')}>
                       <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                 </div>
                 <div className="h-32 w-full bg-muted rounded overflow-hidden border border-border">
                    <img src={localContent.product.image} alt="Preview" className="w-full h-full object-contain p-2" />
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                   <CardTitle>Product Gallery</CardTitle>
                   <CardDescription>Manage additional product images.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addGalleryImage}>
                   <Plus className="h-4 w-4 mr-2" /> Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
               {localContent.product.images && localContent.product.images.map((img, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border p-4 rounded-lg bg-card/50">
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 border border-border">
                       {img ? <img src={img} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6 opacity-20" /></div>}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                       <div className="flex gap-2">
                          <Input 
                            value={img} 
                            onChange={(e) => updateGalleryImage(idx, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1"
                          />
                          <Button variant="outline" size="icon" onClick={() => triggerFileUpload('product', 'images', idx)} title="Upload from Computer">
                             <Upload className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => removeGalleryImage(idx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                 </div>
               ))}
               {(!localContent.product.images || localContent.product.images.length === 0) && (
                 <div className="text-center py-8 border-2 border-dashed rounded-lg opacity-50">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No gallery images added yet.</p>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Manage product name, price, and Amazon purchase link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    value={localContent.product.name} 
                    onChange={(e) => updateContent('product', 'name', e.target.value)}
                    placeholder="Piliora Pili Oil"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input 
                    type="number"
                    value={localContent.product.price} 
                    onChange={(e) => updateContent('product', 'price', e.target.value)}
                    placeholder="85"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amazon Purchase Link</Label>
                <Input 
                  value={localContent.product.amazonLink} 
                  onChange={(e) => updateContent('product', 'amazonLink', e.target.value)}
                  placeholder="https://www.amazon.com/dp/YOUR_PRODUCT_ID"
                />
                <p className="text-sm text-muted-foreground">This link is used for all "Shop on Amazon" buttons across the site.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Update the main headline and subtext.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input 
                  value={localContent.hero.headline} 
                  onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtext</Label>
                <Textarea 
                  value={localContent.hero.subtext} 
                  onChange={(e) => updateContent('hero', 'subtext', e.target.value)}
                  className="h-24"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="science" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Science Section</CardTitle>
              <CardDescription>Edit the "One Ingredient" story.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={localContent.science.title} 
                  onChange={(e) => updateContent('science', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={localContent.science.content} 
                  onChange={(e) => updateContent('science', 'content', e.target.value)}
                  className="h-40"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ritual" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Ritual</CardTitle>
              <CardDescription>Edit the 3-step process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {localContent.ritual.steps.map((step, idx) => (
                <div key={idx} className="p-4 border rounded-md space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-widest">Step 0{idx + 1}</h4>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={step.title} 
                      onChange={(e) => updateContent('ritual', 'title', e.target.value, idx)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={step.text} 
                      onChange={(e) => updateContent('ritual', 'text', e.target.value, idx)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
              <CardDescription>Edit the ingredients benefits section on the home page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Label</Label>
                <Input 
                  value={localContent.benefits?.label || ""} 
                  onChange={(e) => updateContent('benefits', 'label', e.target.value)}
                  placeholder="Nature's Perfect Formula"
                />
              </div>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input 
                  value={localContent.benefits?.heading || ""} 
                  onChange={(e) => updateContent('benefits', 'heading', e.target.value)}
                  placeholder="The Power of Pili Oil"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea 
                  value={localContent.benefits?.subtitle || ""} 
                  onChange={(e) => updateContent('benefits', 'subtitle', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefit Cards</CardTitle>
              <CardDescription>Edit the individual benefit cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(localContent.benefits?.items || []).map((item: { title: string; description: string }, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Card {idx + 1}</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={item.title || ""} 
                      onChange={(e) => {
                        const items = [...(localContent.benefits?.items || [])];
                        items[idx] = { ...items[idx], title: e.target.value };
                        updateContent('benefits', 'items', items);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={item.description || ""} 
                      onChange={(e) => {
                        const items = [...(localContent.benefits?.items || [])];
                        items[idx] = { ...items[idx], description: e.target.value };
                        updateContent('benefits', 'items', items);
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Section</CardTitle>
              <CardDescription>Edit the product gallery section headings on the home page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Label</Label>
                <Input 
                  value={localContent.gallery?.label || ""} 
                  onChange={(e) => updateContent('gallery', 'label', e.target.value)}
                  placeholder="The Experience"
                />
              </div>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input 
                  value={localContent.gallery?.heading || ""} 
                  onChange={(e) => updateContent('gallery', 'heading', e.target.value)}
                  placeholder="Luxury in Every Detail"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Story - Hero Section</CardTitle>
              <CardDescription>Edit the top section of the Our Story page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Label</Label>
                <Input 
                  value={localContent.story?.heroLabel || ""} 
                  onChange={(e) => updateContent('story', 'heroLabel', e.target.value)}
                  placeholder="Our Heritage"
                />
              </div>
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input 
                  value={localContent.story?.heroHeadline || ""} 
                  onChange={(e) => updateContent('story', 'heroHeadline', e.target.value)}
                  placeholder="The Tree of Hope"
                />
              </div>
              <div className="space-y-2">
                <Label>Introduction Text</Label>
                <Textarea 
                  value={localContent.story?.heroIntro || ""} 
                  onChange={(e) => updateContent('story', 'heroIntro', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origin Section</CardTitle>
              <CardDescription>Edit the origin story content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input 
                    value={localContent.story?.originLabel || ""} 
                    onChange={(e) => updateContent('story', 'originLabel', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input 
                    value={localContent.story?.originHeading || ""} 
                    onChange={(e) => updateContent('story', 'originHeading', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content Paragraph 1</Label>
                <Textarea 
                  value={localContent.story?.originContent1 || ""} 
                  onChange={(e) => updateContent('story', 'originContent1', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content Paragraph 2</Label>
                <Textarea 
                  value={localContent.story?.originContent2 || ""} 
                  onChange={(e) => updateContent('story', 'originContent2', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content Paragraph 3</Label>
                <Textarea 
                  value={localContent.story?.originContent3 || ""} 
                  onChange={(e) => updateContent('story', 'originContent3', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-3">
                <Label>Origin Section Image</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={localContent.story?.originImage || ""} 
                      onChange={(e) => handleImageChange('story', 'originImage', e.target.value)}
                      placeholder="https://example.com/origin.jpg"
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={() => triggerFileUpload('story', 'originImage')}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                </div>
                {localContent.story?.originImage && (
                  <div className="h-32 w-full bg-muted rounded overflow-hidden border border-border">
                    <img src={localContent.story.originImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region Title</Label>
                  <Input 
                    value={localContent.story?.originRegionTitle || ""} 
                    onChange={(e) => updateContent('story', 'originRegionTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region Subtitle</Label>
                  <Input 
                    value={localContent.story?.originRegionSubtitle || ""} 
                    onChange={(e) => updateContent('story', 'originRegionSubtitle', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Philosophy Section</CardTitle>
              <CardDescription>Edit the philosophy content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input 
                    value={localContent.story?.philosophyLabel || ""} 
                    onChange={(e) => updateContent('story', 'philosophyLabel', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input 
                    value={localContent.story?.philosophyHeading || ""} 
                    onChange={(e) => updateContent('story', 'philosophyHeading', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Introduction</Label>
                <Textarea 
                  value={localContent.story?.philosophyIntro || ""} 
                  onChange={(e) => updateContent('story', 'philosophyIntro', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commitment Section</CardTitle>
              <CardDescription>Edit the commitment content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Label</Label>
                  <Input 
                    value={localContent.story?.commitmentLabel || ""} 
                    onChange={(e) => updateContent('story', 'commitmentLabel', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input 
                    value={localContent.story?.commitmentHeading || ""} 
                    onChange={(e) => updateContent('story', 'commitmentHeading', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content Paragraph 1</Label>
                <Textarea 
                  value={localContent.story?.commitmentContent1 || ""} 
                  onChange={(e) => updateContent('story', 'commitmentContent1', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content Paragraph 2</Label>
                <Textarea 
                  value={localContent.story?.commitmentContent2 || ""} 
                  onChange={(e) => updateContent('story', 'commitmentContent2', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Header Content</CardTitle>
              <CardDescription>Edit the header tagline and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Header Tagline</Label>
                <Input 
                  value={localContent.layout?.headerTagline || ""} 
                  onChange={(e) => updateContent('layout', 'headerTagline', e.target.value)}
                  placeholder="One ingredient. One ritual."
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Menu Tagline</Label>
                <Input 
                  value={localContent.layout?.mobileMenuTagline || ""} 
                  onChange={(e) => updateContent('layout', 'mobileMenuTagline', e.target.value)}
                  placeholder="Pure Pili Oil from the Philippines"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navigation Labels</CardTitle>
              <CardDescription>Edit the navigation menu link text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Home Link Text</Label>
                  <Input 
                    value={localContent.layout?.navHomeLabel || ""} 
                    onChange={(e) => updateContent('layout', 'navHomeLabel', e.target.value)}
                    placeholder="Home"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Our Story Link Text</Label>
                  <Input 
                    value={localContent.layout?.navStoryLabel || ""} 
                    onChange={(e) => updateContent('layout', 'navStoryLabel', e.target.value)}
                    placeholder="Our Story"
                  />
                </div>
                <div className="space-y-2">
                  <Label>About Link Text (Footer)</Label>
                  <Input 
                    value={localContent.layout?.navAboutLabel || ""} 
                    onChange={(e) => updateContent('layout', 'navAboutLabel', e.target.value)}
                    placeholder="About"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Images</CardTitle>
              <CardDescription>Update the logo images used in navigation and footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Footer Logo</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={localContent.layout?.footerLogo || ""} 
                      onChange={(e) => handleImageChange('layout', 'footerLogo', e.target.value)}
                      placeholder="/logo-footer.png"
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={() => triggerFileUpload('layout', 'footerLogo')}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                </div>
                {localContent.layout?.footerLogo && (
                  <div className="h-20 w-full bg-[#1a1a1a] rounded overflow-hidden border border-border flex items-center justify-center">
                    <img src={localContent.layout.footerLogo} alt="Footer logo preview" className="h-16 w-auto object-contain" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label>Mobile Menu Logo</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={localContent.layout?.mobileLogo || ""} 
                      onChange={(e) => handleImageChange('layout', 'mobileLogo', e.target.value)}
                      placeholder="/logo-footer.png"
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={() => triggerFileUpload('layout', 'mobileLogo')}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                </div>
                {localContent.layout?.mobileLogo && (
                  <div className="h-16 w-full bg-[#1a1a1a] rounded overflow-hidden border border-border flex items-center justify-center">
                    <img src={localContent.layout.mobileLogo} alt="Mobile logo preview" className="h-12 w-auto object-contain" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>Edit the footer description and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Footer Description</Label>
                <Textarea 
                  value={localContent.layout?.footerDescription || ""} 
                  onChange={(e) => updateContent('layout', 'footerDescription', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input 
                  value={localContent.layout?.copyrightText || ""} 
                  onChange={(e) => updateContent('layout', 'copyrightText', e.target.value)}
                  placeholder="Piliora Skincare. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Edit your social media profile URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input 
                  value={localContent.layout?.instagramUrl || ""} 
                  onChange={(e) => updateContent('layout', 'instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/piliora"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input 
                  value={localContent.layout?.facebookUrl || ""} 
                  onChange={(e) => updateContent('layout', 'facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/piliora"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Change Login Credentials</CardTitle>
                  <CardDescription>Update your admin username and password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentUsername">Current Username</Label>
                  <Input 
                    id="currentUsername"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value)}
                    placeholder="Enter current username"
                    data-testid="input-current-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword"
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                      data-testid="input-current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-4">New Credentials</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">New Username</Label>
                    <Input 
                      id="newUsername"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      data-testid="input-new-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pr-10"
                        data-testid="input-new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => credentialsMutation.mutate()}
                disabled={credentialsMutation.isPending || !currentUsername || !currentPassword || !newUsername || !newPassword}
                className="mt-4"
                data-testid="button-update-credentials"
              >
                {credentialsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Credentials"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
