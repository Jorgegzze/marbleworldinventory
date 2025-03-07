import { useQuery } from "@tanstack/react-query";
import { Material } from "@shared/schema";
import MainLayout from "@/components/layout/MainLayout";
import MaterialGrid from "@/components/inventory/MaterialGrid";

export default function Home() {
  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"]
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8 bg-black text-white rounded-lg">
          <h1 className="text-4xl font-bold">Marble World</h1>
        </div>

        {/* Main Inventory Section */}
        <MaterialGrid 
          materials={materials} 
          isLoading={isLoading} 
        />
      </div>
    </MainLayout>
  );
}