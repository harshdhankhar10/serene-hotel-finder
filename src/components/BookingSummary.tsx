
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Users, CheckCircle, MapPin, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hotel, SearchParams, Booking } from "@/types";
import { saveBooking } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";

interface BookingSummaryProps {
  hotel: Hotel;
  searchParams: SearchParams | null;
  onClose: () => void;
}

export function BookingSummary({ hotel, searchParams, onClose }: BookingSummaryProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate default dates if not provided in search params
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const [checkIn, setCheckIn] = useState(searchParams?.checkIn || format(tomorrow, "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState(searchParams?.checkOut || format(nextWeek, "yyyy-MM-dd"));
  const [guests, setGuests] = useState(searchParams?.guests || 2);
  
  // Calculate number of nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate total price
  const totalPrice = hotel.price * nights;
  
  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    
    // Create booking object
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      location: hotel.location,
      checkIn,
      checkOut,
      guests,
      price: totalPrice,
      image: hotel.image,
      bookingDate: new Date().toISOString(),
    };
    
    try {
      // Save booking to localStorage
      saveBooking(booking);
      
      // Show success message
      toast({
        title: "Booking Confirmed!",
        description: `Your stay at ${hotel.name} has been booked successfully.`,
        variant: "default",
      });
      
      // Close dialog and navigate to bookings page
      onClose();
      navigate("/bookings");
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error confirming your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h2 className="font-heading text-xl font-medium">{hotel.name}</h2>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="text-sm">{hotel.location}</span>
              <div className="flex items-center ml-2">
                <Star className="fill-amber-400 text-amber-400 h-3 w-3" />
                <span className="ml-1 text-sm">{hotel.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Booking Summary</DialogTitle>
            <DialogDescription>
              Confirm your stay details before booking
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price per night</span>
                <span>₹{hotel.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Number of nights</span>
                <span>{nights}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-medium">
                <span>Total Price</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Processing..." : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
