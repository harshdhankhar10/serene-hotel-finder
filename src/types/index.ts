
export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  tags: string[];
  description: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  price: number;
  image: string;
  bookingDate: string;
}

export interface SearchParams {
  query: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  searchResults?: Hotel[];
}
