import { Link, useLocation, Redirect } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // If no token or user is not admin/salesrep, redirect to home
  if (!token || !user || !['admin', 'salesrep'].includes(user.role)) {
    return <Redirect to="/" />;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/reservados", label: "Reserved Items" },
    // Only show Users menu to admin
    ...(user.role === 'admin' ? [{ href: "/admin/users", label: "Users Management" }] : [])
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // Redirect to home after logout
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
      </div>
      <div className="grid grid-cols-[240px_1fr] h-[calc(100vh-8rem)]">
        <aside className="border-r bg-card p-4 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "block px-4 py-2 rounded-md hover:bg-primary/10",
                    location === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}