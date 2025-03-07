import { Material } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <img
          src={material.imageUrl || ''}
          alt={material.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{material.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
              {material.category}
            </span>
            <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">
              {material.dimensions}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}