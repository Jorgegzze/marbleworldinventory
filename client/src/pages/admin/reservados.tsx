import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Material } from "@shared/schema";
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
import { RotateCcw, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ReservedItemsPage() {
  const { toast } = useToast();
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);

  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
    select: (data) => data.filter(m => m.estado === "reservado")
  });

  const returnMutation = useMutation({
    mutationFn: async ({ id, cantidad }: { id: number; cantidad: number }) => {
      const token = localStorage.getItem('token');
      const response = await apiRequest("POST", `/api/materials/${id}/devolver`, { 
        cantidad: cantidad  // Ensure we're passing the correct quantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error returning material");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setIsReturnDialogOpen(false);
      setSelectedMaterial(null);
      setReturnQuantity(1);
      toast({
        title: "Success",
        description: "Material returned to inventory successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Return error:', error);
      toast({
        title: "Error",
        description: error.message || "Could not return the material",
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
        title: "Success",
        description: "Material sold successfully",
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

  if (materials.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reserved Materials</h1>
        </div>
        <p className="text-center text-muted-foreground">No reserved materials found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reserved Materials</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.materialId}</TableCell>
                <TableCell>{material.nombre}</TableCell>
                <TableCell>{material.cantidad}</TableCell>
                <TableCell>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Reserved
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setReturnQuantity(material.cantidad);
                      setIsReturnDialogOpen(true);
                    }}
                    title="Return to Inventory"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setSellQuantity(material.cantidad);
                      setIsSellDialogOpen(true);
                    }}
                    title="Sell"
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Return Dialog */}
      <Dialog 
        open={isReturnDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMaterial(null);
            setReturnQuantity(1);
          }
          setIsReturnDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Material to Inventory</DialogTitle>
            <DialogDescription>
              {selectedMaterial && `Material: ${selectedMaterial.nombre} - Reserved quantity: ${selectedMaterial.cantidad}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Return</label>
              <Input
                type="number"
                min="1"
                max={selectedMaterial?.cantidad || 1}
                value={returnQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    setReturnQuantity(Math.min(Math.max(1, value), selectedMaterial?.cantidad || 1));
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
              onClick={() => setIsReturnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMaterial) {
                  returnMutation.mutate({
                    id: selectedMaterial.id,
                    cantidad: returnQuantity
                  });
                }
              }}
              disabled={!selectedMaterial || returnQuantity < 1 || returnQuantity > (selectedMaterial?.cantidad || 0)}
            >
              Confirm Return
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Reserved Material</DialogTitle>
            <DialogDescription>
              {selectedMaterial && `Material: ${selectedMaterial.nombre} - Reserved quantity: ${selectedMaterial.cantidad}`}
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
    </AdminLayout>
  );
}