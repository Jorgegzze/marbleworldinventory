import { useState, useRef } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Material } from "@shared/schema";
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil, Plus, Download, Upload, BookmarkPlus, Trash2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


export default function AdminInventory() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [formData, setFormData] = useState({
    materialId: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    acabado: '',
    presentacion: '',
    dimensiones: '',
    precio: '',
    cantidad: 0,
    imageUrl: '',
    enStock: true,
    estado: "disponible"
  });

  // Fix form handling for adding new material
  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [filters, setFilters] = useState({
    materialId: '',
    nombre: '',
    categoria: '',
    acabado: '',
    presentacion: '',
    dimensiones: '',
    precio: '',
    cantidad: '',
    estado: ''
  });

  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    select: (data) => data.filter(m => m.estado !== "reservado")
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Adding material with data:', data);
      const token = localStorage.getItem('token');
      const response = await apiRequest("POST", "/api/materials", data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error adding material");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsAddDialogOpen(false);
      setFormData({
        materialId: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        acabado: '',
        presentacion: '',
        dimensiones: '',
        precio: '',
        cantidad: 0,
        imageUrl: '',
        enStock: true,
        estado: "disponible"
      });
      toast({
        title: "Success",
        description: "Material added successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Add material error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add material",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Edit mutation data:', data);
      const token = localStorage.getItem('token');
      const response = await apiRequest("PATCH", `/api/materials/${selectedMaterial?.id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error updating material");
      }
      return response.json();
    },
    onSuccess: (updatedMaterial) => {
      console.log('Material updated successfully:', updatedMaterial);
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      toast({
        title: "Success",
        description: "Material updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Edit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update material",
        variant: "destructive",
      });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const token = localStorage.getItem('token');
      const response = await apiRequest("POST", `/api/materials/${id}/reservar`, {
        cantidad: quantity  // Make sure we're using the correct quantity value
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error reserving material");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsReserveDialogOpen(false);
      setSelectedMaterial(null);
      setReserveQuantity(1);
      toast({
        title: "Success",
        description: "Material reserved successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Reservation error:', error);
      toast({
        title: "Error",
        description: error.message || "Could not reserve the material",
        variant: "destructive",
      });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const token = localStorage.getItem('token');
      const response = await apiRequest("POST", `/api/materials/${id}/vender`, {
        cantidad: quantity  // Make sure we're using the correct quantity value
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error selling material");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsSellDialogOpen(false);
      setSelectedMaterial(null);
      setSellQuantity(1);
      toast({
        title: "Material sold",
        description: "The material has been marked as sold successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Sell error:', error);
      toast({
        title: "Error",
        description: error.message || "Could not sell the material",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await apiRequest("DELETE", `/api/materials/${id}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error("Failed to delete material");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (material: Material) => {
    if (confirm(`Are you sure you want to delete ${material.nombre}?`)) {
      deleteMutation.mutate(material.id);
    }
  };

  const downloadTemplate = () => {
    const template = [{
      materialId: "M123",
      name: "Example Material Name",
      description: "Description of the material",
      category: "Stone/Marble/Granite",
      finish: "Polished",
      presentation: "Block",
      dimensions: "60x60x2cm",
      price: "99.99",
      quantity: 10,
      imageUrl: "https://example.com/material-image.jpg"
    }];

    const ws = XLSX.utils.json_to_sheet(template);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 15 }, // materialId
      { wch: 30 }, // name
      { wch: 40 }, // description
      { wch: 20 }, // category
      { wch: 15 }, // finish
      { wch: 15 }, // presentation
      { wch: 15 }, // dimensions
      { wch: 10 }, // price
      { wch: 10 }, // quantity
      { wch: 50 }, // imageUrl
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials Template");
    XLSX.writeFile(wb, "materials_template.xlsx");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const response = await fetch("/api/materials/bulk", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Error uploading materials");
        }

        queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
        toast({
          title: "Success",
          description: "Materials uploaded successfully",
        });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "There was an error processing the file",
          variant: "destructive",
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleReserve = (material: Material) => {
    setSelectedMaterial(material);
    setReserveQuantity(1);
    setIsReserveDialogOpen(true);
  };

  const handleSell = (material: Material) => {
    setSelectedMaterial(material);
    setSellQuantity(1);
    setIsSellDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Image upload response:', data);

      if (selectedMaterial) {
        setSelectedMaterial({
          ...selectedMaterial,
          imageUrl: data.imageUrl
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };


  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isSalesRep = user?.role === 'salesrep';

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Materials Management</h1>
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
            disabled={isSalesRep}
          />
          <Button onClick={downloadTemplate} variant="outline" disabled={isSalesRep}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isSalesRep}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Materials
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isSalesRep}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Material ID</label>
                  <Input
                    placeholder="Enter material ID"
                    value={formData.materialId}
                    onChange={(e) => handleFormChange('materialId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Enter material name"
                    value={formData.nombre}
                    onChange={(e) => handleFormChange('nombre', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Enter description"
                    value={formData.descripcion}
                    onChange={(e) => handleFormChange('descripcion', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    placeholder="Enter category"
                    value={formData.categoria}
                    onChange={(e) => handleFormChange('categoria', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Finish</label>
                  <Input
                    placeholder="Enter finish"
                    value={formData.acabado}
                    onChange={(e) => handleFormChange('acabado', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Presentation</label>
                  <Input
                    placeholder="Enter presentation"
                    value={formData.presentacion}
                    onChange={(e) => handleFormChange('presentacion', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dimensions</label>
                  <Input
                    placeholder="Enter dimensions"
                    value={formData.dimensiones}
                    onChange={(e) => handleFormChange('dimensiones', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    placeholder="Enter price"
                    value={formData.precio}
                    onChange={(e) => handleFormChange('precio', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    value={formData.cantidad}
                    onChange={(e) => handleFormChange('cantidad', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        placeholder="Enter image URL or select file"
                        value={formData.imageUrl}
                        onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload
                      </Button>
                    </div>
                    {formData.imageUrl && (
                      <div className="relative w-32 h-32 border rounded">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            console.log('Preview error:', img.src);
                            img.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => addMutation.mutate(formData)} 
                  disabled={!formData.materialId || !formData.nombre}
                >
                  Add Material
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Filter by Material ID"
          value={filters.materialId}
          onChange={(e) => setFilters({ ...filters, materialId: e.target.value })}
        />
        <Input
          placeholder="Filter by Name"
          value={filters.nombre}
          onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
        />
        <Input
          placeholder="Filter by Category"
          value={filters.categoria}
          onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
        />
        <Input
          placeholder="Filter by Finish"
          value={filters.acabado}
          onChange={(e) => setFilters({ ...filters, acabado: e.target.value })}
        />
        <Input
          placeholder="Filter by Presentation"
          value={filters.presentacion}
          onChange={(e) => setFilters({ ...filters, presentacion: e.target.value })}
        />
        <Input
          placeholder="Filter by Dimensions"
          value={filters.dimensiones}
          onChange={(e) => setFilters({ ...filters, dimensiones: e.target.value })}
        />
        <Input
          placeholder="Filter by Price"
          value={filters.precio}
          onChange={(e) => setFilters({ ...filters, precio: e.target.value })}
        />
        <Input
          placeholder="Filter by Quantity"
          value={filters.cantidad}
          onChange={(e) => setFilters({ ...filters, cantidad: e.target.value })}
        />
        <Input
          placeholder="Filter by Status"
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Material ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Finish</TableHead>
              <TableHead>Presentation</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials
              .filter(material => {
                return (
                  material.materialId.toLowerCase().includes(filters.materialId.toLowerCase()) &&
                  material.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
                  material.categoria.toLowerCase().includes(filters.categoria.toLowerCase()) &&
                  material.acabado.toLowerCase().includes(filters.acabado.toLowerCase()) &&
                  material.presentacion.toLowerCase().includes(filters.presentacion.toLowerCase()) &&
                  material.dimensiones.toLowerCase().includes(filters.dimensiones.toLowerCase()) &&
                  material.precio.toLowerCase().includes(filters.precio.toLowerCase()) &&
                  String(material.cantidad).includes(filters.cantidad) &&
                  (material.cantidad > 0 ? "Available" : "Out of stock").toLowerCase().includes(filters.estado.toLowerCase())
                );
              })
              .map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <img
                      src={material.imageUrl || '/placeholder-image.png'}
                      alt={material.nombre}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.log('Image load error for:', img.src);
                        if (!img.src.includes('placeholder-image.png')) {
                          console.log('Using placeholder image');
                          img.src = '/placeholder-image.png';
                        }
                      }}
                      style={{
                        minWidth: '64px',
                        minHeight: '64px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f7fafc'
                      }}
                    />
                  </TableCell>
                  <TableCell>{material.materialId}</TableCell>
                  <TableCell>{material.nombre}</TableCell>
                  <TableCell>{material.categoria}</TableCell>
                  <TableCell>{material.acabado}</TableCell>
                  <TableCell>{material.presentacion}</TableCell>
                  <TableCell>{material.dimensiones}</TableCell>
                  <TableCell>{material.precio}</TableCell>
                  <TableCell>{material.cantidad}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      material.cantidad > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {material.cantidad > 0 ? "Available" : "Out of stock"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(material)}
                      title="Edit"
                      disabled={isSalesRep}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(material)}
                      title="Delete"
                      disabled={isSalesRep}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReserve(material)}
                      title="Reserve"
                      disabled={material.cantidad < 1}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSell(material)}
                      title="Sell"
                      disabled={material.cantidad < 1}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Reserve Dialog */}
      <Dialog
        open={isReserveDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMaterial(null);
            setReserveQuantity(1);
          }
          setIsReserveDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reserve Material</DialogTitle>
            <DialogDescription>
              {selectedMaterial && `Material: ${selectedMaterial.nombre} - Available quantity: ${selectedMaterial.cantidad}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Reserve</label>
              <Input
                type="number"
                min="1"
                max={selectedMaterial?.cantidad || 1}
                value={reserveQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setReserveQuantity(Math.min(Math.max(1, value), selectedMaterial?.cantidad || 1));
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Enter a number between 1 and {selectedMaterial?.cantidad}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReserveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMaterial) {
                  reserveMutation.mutate({
                    id: selectedMaterial.id,
                    quantity: reserveQuantity
                  });
                }
              }}
              disabled={!selectedMaterial || reserveQuantity < 1 || reserveQuantity > (selectedMaterial?.cantidad || 0)}
            >
              Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog
        open={isSellDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMaterial(null);
            setSellQuantity(1);
          }
          setIsSellDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sell Material</DialogTitle>
            <DialogDescription>
              {selectedMaterial && `Material: ${selectedMaterial.nombre} - Available quantity: ${selectedMaterial.cantidad}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Sell</label>
              <Input
                type="number"
                min="1"
                max={selectedMaterial?.cantidad || 1}
                value={sellQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setSellQuantity(Math.min(Math.max(1, value), selectedMaterial?.cantidad || 1));
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Enter a number between 1 and {selectedMaterial?.cantidad}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSellDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMaterial) {
                  sellMutation.mutate({
                    id: selectedMaterial.id,
                    quantity: sellQuantity
                  });
                }
              }}
              disabled={!selectedMaterial || sellQuantity < 1 || sellQuantity > (selectedMaterial?.cantidad || 0)}
            >
              Confirm Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Material ID</label>
              <Input
                placeholder="Enter material ID"
                value={selectedMaterial?.materialId || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      materialId: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter name"
                value={selectedMaterial?.nombre || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      nombre: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Enter description"
                value={selectedMaterial?.descripcion || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      descripcion: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Enter category"
                value={selectedMaterial?.categoria || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      categoria: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Finish</label>
              <Input
                placeholder="Enter finish"
                value={selectedMaterial?.acabado || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      acabado: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Presentation</label>
              <Input
                placeholder="Enter presentation"
                value={selectedMaterial?.presentacion || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      presentacion: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dimensions</label>
              <Input
                placeholder="Enter dimensions"
                value={selectedMaterial?.dimensiones || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      dimensiones: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Price</label>
              <Input
                placeholder="Enter price"
                value={selectedMaterial?.precio || ''}
                onChange={(e) => {
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      precio: e.target.value
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="0"
                placeholder="Enter quantity"
                value={selectedMaterial?.cantidad || 0}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 0;
                  if (selectedMaterial) {
                    setSelectedMaterial({
                      ...selectedMaterial,
                      cantidad: newQuantity,
                      enStock: newQuantity > 0,
                      estado: newQuantity > 0 ? "disponible" : "agotado"
                    });
                  }
                }}
              />
            </div>
            <div className="space-y2">
              <label className="text-sm font-medium">Image</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Enter image URL or select file"
                    value={selectedMaterial?.imageUrl || ''}
                    onChange={(e) => {
                      if (selectedMaterial) {
                        setSelectedMaterial({
                          ...selectedMaterial,
                          imageUrl: e.target.value
                        });
                      }
                    }}
                  />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Open Replit's file picker when available
                      if (window.showDirectoryPicker) {
                        window.showDirectoryPicker().then(async (handle) => {
                          for await (const entry of handle.values()) {
                            if (entry.kind === 'file' && entry.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                              const file = await entry.getFile();
                              const formData = new FormData();
                              formData.append('image', file);

                              try {
                                const token = localStorage.getItem('token');
                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: formData
                                });

                                if (!response.ok) {
                                  throw new Error('Failed to upload image');
                                }

                                const data = await response.json();
                                if (selectedMaterial) {
                                  setSelectedMaterial({
                                    ...selectedMaterial,
                                    imageUrl: data.imageUrl
                                  });
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                              break; // Only handle the first image file
                            }
                          }
                        }).catch(error => {
                          console.error('File picker error:', error);
                          // Fallback to regular file input if directory picker fails
                          fileInputRef.current?.click();
                        });
                      } else {
                        // Fallback to regular file input
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    Choose File
                  </Button>
                </div>
                {selectedMaterial?.imageUrl && (
                  <div className="relative w-32 h-32 border rounded">
                    <img
                      src={selectedMaterial.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.log('Preview image load error for:', img.src);
                        if (!img.src.includes('placeholder-image.png')) {
                          console.log('Using placeholder for preview');
                          img.src = '/placeholder-image.png';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedMaterial) {
                console.log('Submitting material update:', selectedMaterial);
                editMutation.mutate(selectedMaterial);
              }
            }} disabled={!selectedMaterial}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}