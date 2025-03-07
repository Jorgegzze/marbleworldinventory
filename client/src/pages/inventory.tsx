import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import FilterModal from "@/components/inventory/FilterModal";
import MaterialGrid from "@/components/inventory/MaterialGrid";
import { Material } from "@shared/schema";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  // Filter materials based on search and material selection
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.block?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (material.bundle?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (material.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesMaterial = !selectedMaterial || material.materialId === selectedMaterial;

    return matchesSearch && matchesMaterial;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-[#34495E] text-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Inventory</h1>
          <FilterModal
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedMaterial={selectedMaterial}
            onMaterialChange={setSelectedMaterial}
          />
        </div>

        <MaterialGrid 
          materials={filteredMaterials} 
          isLoading={isLoading} 
        />
      </div>
    </MainLayout>
  );
}