import { useState } from "react";
import { Material } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialGridProps {
  materials: Material[];
  isLoading?: boolean;
}

export default function MaterialGrid({ materials, isLoading }: MaterialGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const availableMaterials = materials.filter(m => m.estado !== "reservado");

  // Get unique categories
  const categories = ['all', ...new Set(availableMaterials.map(m => m.categoria))];

  // Filter by category
  const filteredMaterials = selectedCategory === 'all'
    ? availableMaterials
    : availableMaterials.filter(m => m.categoria === selectedCategory);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map((material) => (
          <Card key={`${material.id}-${material.nombre}`} className="overflow-hidden">
            <div className="p-4 bg-secondary/10">
              <h3 className="font-bold text-lg text-center">{material.nombre}</h3>
            </div>

            {material.imageUrl && (
              <div 
                className="relative aspect-[4/3] w-full cursor-pointer"
                onClick={() => setSelectedImage(material.imageUrl)}
              >
                <img
                  src={material.imageUrl}
                  alt={material.nombre}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Stock Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    material.cantidad > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {material.cantidad} {material.cantidad === 1 ? "Unit" : "Units"} Available
                </span>
              </div>

              {material.categoria && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Category:</span>
                  <span className="text-muted-foreground">{material.categoria}</span>
                </div>
              )}

              {material.dimensiones && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Dimensions:</span>
                  <span className="text-muted-foreground">{material.dimensiones}</span>
                </div>
              )}

              {material.acabado && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Finish:</span>
                  <span className="text-muted-foreground">{material.acabado}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Zoomed view"
              className="w-full h-auto"
              onClick={() => setSelectedImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}