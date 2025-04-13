
import { Link } from "react-router-dom";
import { Hotel, UserCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <Hotel className="h-6 w-6 text-primary" />
          <span className="font-heading font-semibold text-xl">GeminHotels</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/bookings" className="text-sm font-medium hover:text-primary transition-colors">
            My Bookings
          </Link>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <Link to="/">
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link to="/bookings">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
