
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin, Users, X, Hotel, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Booking } from "@/types";
import { getBookings, cancelBooking } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const { toast } = useToast();
  
  // Load bookings from localStorage
  useEffect(() => {
    const loadedBookings = getBookings();
    setBookings(loadedBookings);
  }, []);
  
  const handleCancelBooking = () => {
    if (!bookingToCancel) return;
    
    try {
      // Cancel booking
      cancelBooking(bookingToCancel.id);
      
      // Update bookings state
      setBookings(bookings.filter(booking => booking.id !== bookingToCancel.id));
      
      // Show success message
      toast({
        title: "Booking Cancelled",
        description: `Your booking at ${bookingToCancel.hotelName} has been cancelled.`,
        variant: "default",
      });
      
      // Close dialog
      setBookingToCancel(null);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "There was an error cancelling your booking. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PP");
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">My Bookings</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <Hotel className="mr-2 h-4 w-4" />
            Find Hotels
          </Link>
        </Button>
      </div>
      
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-40">
                <img 
                  src={booking.image} 
                  alt={booking.hotelName} 
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => setBookingToCancel(booking)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4">
                <h3 className="font-heading font-medium text-lg mb-2">{booking.hotelName}</h3>
                
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="h-3 w-3 mr-1" />
                  {booking.location}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span>{booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{booking.price.toLocaleString()}</span>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Booked on {format(parseISO(booking.bookingDate), "PP")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8">
          <div className="text-4xl mb-4">🏨</div>
          <h3 className="font-heading text-xl font-medium mb-2">No bookings yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't made any hotel bookings yet. Start by searching for hotels.
          </p>
          <Button asChild>
            <Link to="/">Search Hotels</Link>
          </Button>
        </div>
      )}
      
      {/* Confirmation dialog for cancelling booking */}
      {bookingToCancel && (
        <Dialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Cancel Booking
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your booking at {bookingToCancel.hotelName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingToCancel(null)}>Keep Booking</Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyBookings;
