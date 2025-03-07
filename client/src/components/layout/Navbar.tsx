import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-bold">Inventory System</a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/admin">
            <a className="text-muted-foreground hover:text-foreground">
              Admin Panel
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}