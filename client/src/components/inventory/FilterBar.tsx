import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  selectedMaterial: string | null;
  onMaterialChange: (material: string | null) => void;
}

export default function FilterBar({
  selectedMaterial,
  onMaterialChange,
}: FilterBarProps) {
  const materials = [
    { value: "-1", label: "( Select )" },
    { value: "308", label: "Acará Ruby" },
    { value: "48", label: "Adamantium" },
    { value: "335", label: "Admiral Blue" },
    { value: "195", label: "Alaska Antico" },
    { value: "207", label: "Alaskino" },
    { value: "283", label: "All Black" },
    { value: "18", label: "Allure" },
    { value: "251", label: "Alpinus" },
    { value: "38", label: "Alpinus Gold" },
    // Add all other materials from the source file
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">MATERIAL</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedMaterial || "-1"}
          onValueChange={(value) => onMaterialChange(value === "-1" ? null : value)}
        >
          <SelectTrigger className="w-full" style={{ color: "#888888" }}>
            <SelectValue placeholder="( Select )" />
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
      </CardContent>
    </Card>
  );
}