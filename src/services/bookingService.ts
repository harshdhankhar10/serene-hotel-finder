
import { Booking, Hotel } from "@/types";

// Key for storing bookings in localStorage
const BOOKINGS_STORAGE_KEY = "hotel_bookings";

export function getBookings(): Booking[] {
  try {
    const bookingsJson = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return bookingsJson ? JSON.parse(bookingsJson) : [];
  } catch (error) {
    console.error("Error getting bookings from localStorage:", error);
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  try {
    const bookings = getBookings();
    
    // Add new booking with current timestamp
    const newBooking = {
      ...booking,
      bookingDate: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Error saving booking to localStorage:", error);
  }
}

export function cancelBooking(bookingId: string): void {
  try {
    const bookings = getBookings();
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
  } catch (error) {
    console.error("Error canceling booking from localStorage:", error);
  }
}

export function saveSearchParams(params: any): void {
  try {
    localStorage.setItem("last_search_params", JSON.stringify(params));
  } catch (error) {
    console.error("Error saving search params to localStorage:", error);
  }
}

export function getLastSearchParams(): any {
  try {
    const paramsJson = localStorage.getItem("last_search_params");
    return paramsJson ? JSON.parse(paramsJson) : null;
  } catch (error) {
    console.error("Error getting search params from localStorage:", error);
    return null;
  }
}
