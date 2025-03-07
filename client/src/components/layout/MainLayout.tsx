import { Link } from "wouter";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoginDialog } from "@/components/auth/LoginDialog";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <LoginDialog />
      </div>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}