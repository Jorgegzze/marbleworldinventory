import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <p className="text-muted-foreground">
              <a href="https://www.marbleworld.com/" 
                 className="text-primary hover:underline"
                 target="_blank"
                 rel="noopener noreferrer">
                www.marbleworld.com
              </a>
            </p>
            <p className="text-muted-foreground">
              2da de Magnolia 1617, <br />
              Colonia Reforma, <br />
              Monterrey, Nuevo León, <br />
              México
            </p>
          </div>

          {/* Hours */}
          <div>
            <p className="text-muted-foreground">
              Lunes - Viernes: 9:30 AM - 5:30 PM<br />
              Sábado: 10:00 AM - 1:00 PM<br />
              Domingo: Cerrado
            </p>
          </div>

          {/* Social Media */}
          <div>
            <div className="flex flex-col gap-4">
              <a
                href="https://www.instagram.com/marbleworldmex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <SiInstagram className="h-6 w-6" />
                <span className="ml-2">@marbleworldmex</span>
              </a>
              <a
                href="https://www.facebook.com/marbleworldmex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <SiFacebook className="h-6 w-6" />
                <span className="ml-2">marbleworldmex</span>
              </a>
              <a
                href="https://wa.me/528140488845"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <SiWhatsapp className="h-6 w-6" />
                <span className="ml-2">+52 81 4048 8845</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}