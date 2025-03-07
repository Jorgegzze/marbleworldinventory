import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterModalProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedMaterial: string | null;
  onMaterialChange: (value: string | null) => void;
}

const materials = [
  { value: "-1", label: "( Seleccionar )" },
  { value: "308", label: "Acará Ruby" },
  { value: "48", label: "Adamantium" },
  { value: "335", label: "Admiral Blue" },
  { value: "195", label: "Alaska Antico" },
  { value: "207", label: "Alaskino" },
  { value: "283", label: "All Black" },
  { value: "18", label: "Allure" },
  { value: "251", label: "Alpinus" },
  { value: "38", label: "Alpinus Gold" },
];

export default function FilterModal({
  searchQuery,
  onSearchChange,
  selectedMaterial,
  onMaterialChange,
}: FilterModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fa fa-sliders mr-2" />
            FILTRAR POR:
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">BÚSQUEDA</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="(Nombre del Material, Bloque, Paquete, Ubicación)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">MATERIAL</label>
            <Select
              value={selectedMaterial || "-1"}
              onValueChange={(value) => onMaterialChange(value === "-1" ? null : value)}
            >
              <SelectTrigger className="w-full" style={{ color: "#888888" }}>
                <SelectValue placeholder="( Seleccionar )" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem
                    key={material.value}
                    value={material.value}
                    className="text-sm"
                  >
                    {material.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}