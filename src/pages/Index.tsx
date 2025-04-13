import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Search, 
  Sparkles, 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  Calculator,
  Hotel,
  Plane,
  Globe,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processSearchQuery } from '@/services/aiService';
import { saveSearchParams } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import HotelCalculator from '@/components/HotelCalculator';
import TeamMembers from '@/components/TeamMembers';

const featuredDestinations = [
  { 
    name: 'Goa', 
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000', 
    price: '₹3,500', 
    rating: 4.7 
  },
  { 
    name: 'Mumbai', 
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&q=80&w=1000', 
    price: '₹4,200', 
    rating: 4.5 
  },
  { 
    name: 'Bali', 
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000', 
    price: '$78', 
    rating: 4.9 
  },
  { 
    name: 'Paris', 
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000', 
    price: '€120', 
    rating: 4.8 
  },
];

const testimonials = [
  {
    name: "Sarah T.",
    image: "https://images.unsplash.com/photo-1494790108377-bee7453e911c?auto=format&fit=crop&q=80&w=256",
    comment: "The AI search feature made finding the perfect beach resort so easy. I just typed what I wanted, and it found exactly what I was looking for!",
    location: "New York, USA"
  },
  {
    name: "Raj Patel",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    comment: "I love how the app automatically adjusted prices to my local currency. The whole booking process was seamless.",
    location: "Mumbai, India"
  },
  {
    name: "Emma Wilson",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    comment: "The budget calculator helped me plan my entire trip while staying within my budget. Fantastic feature!",
    location: "London, UK"
  }
];

const currencyByLocation = {
  "India": { symbol: "₹", code: "INR" },
  "USA": { symbol: "$", code: "USD" },
  "Europe": { symbol: "€", code: "EUR" },
  "UK": { symbol: "£", code: "GBP" },
  "Japan": { symbol: "¥", code: "JPY" },
  "Australia": { symbol: "A$", code: "AUD" },
  "Singapore": { symbol: "S$", code: "SGD" },
  "UAE": { symbol: "AED", code: "AED" },
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 2));
  const [guests, setGuests] = useState(2);
  const [selectedLocation, setSelectedLocation] = useState("India");
  const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    const currency = currencyByLocation[selectedLocation as keyof typeof currencyByLocation];
    if (!currency) return `₹${amount}`;
    
    const rates = {
      "INR": 1,
      "USD": 0.012,
      "EUR": 0.011,
      "GBP": 0.0095,
      "JPY": 1.8,
      "AUD": 0.018,
      "SGD": 0.016,
      "AED": 0.044
    };
    
    const convertedAmount = Math.round(amount * rates[currency.code as keyof typeof rates]);
    return `${currency.symbol}${convertedAmount.toLocaleString()}`;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query is empty",
        description: "Please enter a hotel search query",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const searchParams = await processSearchQuery(searchQuery);
      
      if (!searchParams.checkIn && checkIn) {
        searchParams.checkIn = format(checkIn, 'yyyy-MM-dd');
      }
      if (!searchParams.checkOut && checkOut) {
        searchParams.checkOut = format(checkOut, 'yyyy-MM-dd');
      }
      if (!searchParams.guests) {
        searchParams.guests = guests;
      }
      
      saveSearchParams(searchParams);
      navigate('/results', { state: { searchParams } });
    } catch (error) {
      console.error('Error processing search:', error);
      toast({
        title: "Search failed",
        description: "There was an error processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-7xl px-4">
        <div className="text-center mb-8 pt-8 animate-fade-in">
          <h1 className="font-heading text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
            Find Your Dream Stay with <span className="ai-gradient-text">AI Assistance</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Describe your perfect hotel in natural language, and our AI will find the best matches tailored for you in seconds.
          </p>
          
          <div className="relative mb-12 animate-fade-in rounded-3xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-70 transform -rotate-1 scale-105"></div>
            <div className="relative bg-white p-8 rounded-2xl">
              <Tabs defaultValue="natural" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="natural">Natural Language Search</TabsTrigger>
                  <TabsTrigger value="structured">Structured Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="natural" className="space-y-6">
                  <div className="flex items-center mb-4">
                    <Sparkles className="text-primary h-5 w-5 mr-2" />
                    <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Find hotels like '3-star hotel in Goa for 2 people under ₹4000 near the beach with pool access'"
                      className="w-full pl-4 pr-12 py-7 text-lg rounded-xl border-2 border-slate-200 focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Button variant="ghost" size="icon" type="button" className="h-8 w-8">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Voice search</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="structured" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <div className="flex">
                        <Input 
                          type="text" 
                          placeholder="Where are you going?" 
                          className="rounded-l-md rounded-r-none" 
                        />
                        <Button variant="outline" className="rounded-l-none border-l-0">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Check-in</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Check-out</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <Calendar className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Guests</label>
                      <div className="flex">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="rounded-r-none"
                        >
                          -
                        </Button>
                        <div className="px-4 py-2 border-y border-input flex items-center justify-center min-w-[4rem]">
                          {guests}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setGuests(guests + 1)}
                          className="rounded-l-none"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-x-2">
                      <select 
                        className="px-3 py-2 bg-white border border-input rounded-md text-sm" 
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        {Object.keys(currencyByLocation).map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCalculator(!showCalculator)}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Budget Calculator
                      </Button>
                    </div>
                  </div>
                  
                  {showCalculator && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <HotelCalculator 
                        defaultCurrency={currencyByLocation[selectedLocation as keyof typeof currencyByLocation]?.code || "INR"} 
                      />
                    </div>
                  )}
                </TabsContent>
                
                <Button 
                  onClick={handleSearch} 
                  className="w-full mt-6 py-6 text-lg font-medium rounded-xl"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <span className="animate-pulse mr-2">Processing your search</span>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Search className="mr-2 h-5 w-5" />
                      Search Hotels
                    </div>
                  )}
                </Button>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Try searches like:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      "Luxury hotel with ocean view in Goa", 
                      "Budget hotel in Mumbai for family", 
                      "Pet-friendly hotels in Bangalore",
                      "Beach resort in Bali under $100",
                      "Historic hotel in Paris with Eiffel Tower view"
                    ].map((example) => (
                      <button
                        key={example}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs"
                        onClick={() => setSearchQuery(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
        
        <section className="mb-16 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading text-2xl font-bold">Featured Destinations</h2>
            <Button variant="link" className="font-medium">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="aspect-w-16 aspect-h-9 w-full h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-heading text-xl font-bold">{destination.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm font-medium">Starting from {destination.price}</p>
                    <div className="flex items-center">
                      <Star className="fill-yellow-400 stroke-yellow-400 h-4 w-4 mr-1" />
                      <span className="text-sm">{destination.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-16 py-10 px-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold mb-3">Why Choose Our AI Hotel Finder</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Discover the perfect stay with our cutting-edge AI technology that understands your needs better than traditional search filters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-heading font-medium text-xl mb-2">AI-Powered Search</h3>
              <p className="text-muted-foreground">Simply describe your ideal stay in natural language, and our AI will understand exactly what you need.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-heading font-medium text-xl mb-2">Global Currency Support</h3>
              <p className="text-muted-foreground">View prices in your local currency with real-time conversion rates for a seamless booking experience.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-heading font-medium text-xl mb-2">Budget Calculator</h3>
              <p className="text-muted-foreground">Plan your entire trip with our intelligent budget calculator that helps you stay within your spending limits.</p>
            </div>
          </div>
        </section>
        
        <section className="mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">What Our Customers Say</h2>
          
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground flex-1">"{testimonial.comment}"</p>
                    <div className="flex mt-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="relative inset-0 translate-y-0 left-0 mr-2" />
              <CarouselNext className="relative inset-0 translate-y-0 right-0" />
            </div>
          </Carousel>
        </section>
        
        <section className="mb-16 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="bg-gradient-to-r from-primary/90 to-purple-600/90 text-white py-12 px-6 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">Ready to Find Your Perfect Stay?</h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">Let our AI assistant find the ideal accommodation for your next adventure. Just describe what you're looking for.</p>
              <Button 
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
              >
                Start Searching Now
              </Button>
            </div>
          </div>
        </section>
        
        <section className="mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <h2 className="font-heading text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How does the AI-powered search work?",
                answer: "Our AI uses natural language processing to understand your hotel preferences. Simply type what you're looking for in plain English, and the AI will extract relevant search parameters like location, dates, price range, and amenities."
              },
              {
                question: "Are the prices shown in my local currency?",
                answer: "Yes! Select your region from the dropdown menu, and all prices will be displayed in your local currency with real-time conversion rates."
              },
              {
                question: "Can I save my favorite hotels for later?",
                answer: "Absolutely. Create an account to save your favorite hotels, compare them side by side, and receive price alerts when rates drop."
              },
              {
                question: "Is my booking information secure?",
                answer: "Yes, all your booking information is securely stored and encrypted. We never share your personal data with third parties without your consent."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-heading font-medium text-lg mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
        
        <TeamMembers />
      </div>
    </div>
  );
};

export default Index;
