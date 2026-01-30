import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PRODUCT } from "@/lib/data";

// Mock initial data based on our single product, duplicated for effect
const INITIAL_PRODUCTS = [
  { ...PRODUCT, id: "pili-oil-001", stock: 124, status: "Active" },
  { ...PRODUCT, id: "pili-oil-002", name: "Pili Oil (Travel Size)", price: 45.00, volume: "15ml / 0.5oz", stock: 45, status: "Active" },
  { ...PRODUCT, id: "pili-oil-003", name: "Pili Body Butter", price: 65.00, volume: "200ml / 6.7oz", stock: 0, status: "Out of Stock" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Product Deleted", description: "The product has been removed from the catalog." });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newProduct = {
      id: editingProduct ? editingProduct.id : `pili-${Math.floor(Math.random() * 1000)}`,
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      status: parseInt(formData.get("stock") as string) > 0 ? "Active" : "Out of Stock",
      volume: formData.get("volume") as string,
      subtitle: "The Essence of Moisturization", // Default
      description: formData.get("description") as string,
      images: PRODUCT.images, // Default
      ingredients: PRODUCT.ingredients, // Default
      benefits: PRODUCT.benefits, // Default
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProduct } : p));
      toast({ title: "Product Updated", description: "Changes have been saved successfully." });
    } else {
      setProducts([...products, newProduct]);
      toast({ title: "Product Created", description: "New product has been added to the catalog." });
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-12 h-12 bg-muted rounded-sm overflow-hidden">
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  <div className="text-xs text-muted-foreground">{product.id}</div>
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Make changes to the product here." : "Add a new product to your catalog."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume/Size</Label>
                <Input id="volume" name="volume" defaultValue={editingProduct?.volume} placeholder="e.g. 30ml" required />
              </div>
              <div className="space-y-2">
                 <Label>Images</Label>
                 <Button type="button" variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                 </Button>
                 <p className="text-[10px] text-muted-foreground mt-1">Use Cloudinary for persistent storage in production.</p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingProduct?.description} className="h-24" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
