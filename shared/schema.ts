import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  materialId: text("material_id").notNull(),
  nombre: text("name").notNull(),
  descripcion: text("description"),
  categoria: text("category"), // Para recomendados, nuevos, en_oferta, proximamente
  bloque: text("block"),
  paquete: text("bundle"),
  dimensiones: text("dimensions"),
  acabado: text("finish"),
  presentacion: text("presentation"),
  imageUrl: text("image_url"),
  precio: text("price"),
  cantidad: integer("quantity").notNull().default(1),
  enStock: boolean("in_stock").default(true),
  estado: text("status").default("disponible"), // disponible, reservado, vendido
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("guest"), // admin, salesrep, guest
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

// Esquemas de inserción
export const insertMaterialSchema = createInsertSchema(materials).omit({ 
  id: true 
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  resetToken: true,
  resetTokenExpiry: true
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

// Tipos
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Estados predefinidos
export const MATERIAL_STATUS = {
  DISPONIBLE: "disponible",
  RESERVADO: "reservado",
  VENDIDO: "vendido",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  SALESREP: "salesrep",
  GUEST: "guest",
} as const;