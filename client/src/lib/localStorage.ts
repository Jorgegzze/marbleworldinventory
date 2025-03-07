import { Material, InsertMaterial } from '@shared/schema';

class LocalStorageDB {
  private materials: Material[];
  private currentId: number;

  constructor() {
    // Load initial data from localStorage
    const storedMaterials = localStorage.getItem('materials');
    this.materials = storedMaterials ? JSON.parse(storedMaterials) : [];
    this.currentId = this.materials.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  }

  private save(): void {
    localStorage.setItem('materials', JSON.stringify(this.materials));
  }

  // Convert file to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Material operations
  async getMaterials(): Promise<Material[]> {
    return this.materials;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.find(m => m.id === id);
  }

  async getMaterialByMaterialId(materialId: string): Promise<Material | undefined> {
    return this.materials.find(
      m => m.materialId === materialId && m.estado === "disponible"
    );
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const newMaterial: Material = {
      ...material,
      id: this.currentId++,
      imageUrl: material.imageUrl || '',
      enStock: Boolean(material.cantidad && material.cantidad > 0),
      estado: material.estado || "disponible",
      categoria: material.categoria || null,
      descripcion: material.descripcion || null,
      bloque: material.bloque || null,
      paquete: material.paquete || null,
      dimensiones: material.dimensiones || null,
      acabado: material.acabado || null,
      presentacion: material.presentacion || null,
      precio: material.precio || null,
      cantidad: material.cantidad || 0
    };
    this.materials.push(newMaterial);
    this.save();
    console.log('Created material:', newMaterial);
    return newMaterial;
  }

  async updateMaterial(id: number, updates: Partial<Material>): Promise<Material | undefined> {
    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...this.materials[index],
      ...updates,
      enStock: updates.cantidad !== undefined ? updates.cantidad > 0 : this.materials[index].cantidad > 0
    };
    this.materials[index] = updated;
    this.save();
    console.log('Updated material:', updated);
    return updated;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.materials.splice(index, 1);
    this.save();
    return true;
  }

  // Handle image upload
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const base64Data = await this.fileToBase64(file);
      return { imageUrl: base64Data };
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  // Reserve material
  async reserveMaterial(id: number, quantity: number): Promise<Material | undefined> {
    const material = await this.getMaterial(id);
    if (!material || quantity > material.cantidad) return undefined;

    // Update original material quantity
    await this.updateMaterial(material.id, {
      cantidad: material.cantidad - quantity,
      enStock: (material.cantidad - quantity) > 0
    });

    // Create new reserved material
    const reservedMaterial = await this.createMaterial({
      ...material,
      cantidad: quantity,
      estado: "reservado",
      enStock: true
    });

    return reservedMaterial;
  }

  // Sell material
  async sellMaterial(id: number, quantity: number): Promise<boolean> {
    const material = await this.getMaterial(id);
    if (!material || quantity > material.cantidad) return false;

    if (material.estado === "reservado") {
      if (quantity === material.cantidad) {
        await this.deleteMaterial(material.id);
      } else {
        await this.updateMaterial(material.id, {
          cantidad: material.cantidad - quantity
        });
      }
    } else {
      await this.updateMaterial(material.id, {
        cantidad: material.cantidad - quantity,
        estado: material.cantidad <= quantity ? "vendido" : "disponible",
        enStock: material.cantidad > quantity
      });
    }

    return true;
  }
  
  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export const localDB = new LocalStorageDB();