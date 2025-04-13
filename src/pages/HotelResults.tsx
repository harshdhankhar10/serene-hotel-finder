
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Wifi, Coffee, Utensils, Dumbbell, Bath, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Hotel, SearchParams } from '@/types';
import { getHotelSuggestions } from '@/services/aiService';
import { BookingSummary } from '@/components/BookingSummary';

const HotelResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 10000]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        // Get search params from location state or fall back to default search
        const params = location.state?.searchParams || { query: "hotels in popular destinations" };
        setSearchParams(params);
        
        // Set initial price range based on search params
        if (params.priceMin !== undefined && params.priceMax !== undefined) {
          setPriceRange([params.priceMin, params.priceMax]);
        }
        
        // Fetch hotel suggestions
        const hotelResults = await getHotelSuggestions(params);
        setHotels(hotelResults);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, [location]);
  
  // Filter hotels based on selected filters and price range
  const filteredHotels = hotels.filter(hotel => {
    // Filter by price range
    if (hotel.price < priceRange[0] || hotel.price > priceRange[1]) {
      return false;
    }
    
    // If filters are selected, check if hotel has at least one of them
    if (selectedFilters.length > 0) {
      return hotel.tags.some(tag => selectedFilters.includes(tag));
    }
    
    return true;
  });
  
  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
  };
  
  const handleCloseDialog = () => {
    setSelectedHotel(null);
  };
  
  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  const filterOptions = [
    { label: "Free Wi-Fi", value: "Free Wi-Fi", icon: <Wifi className="h-4 w-4" /> },
    { label: "Breakfast Included", value: "Breakfast Included", icon: <Coffee className="h-4 w-4" /> },
    { label: "Restaurant", value: "Restaurant", icon: <Utensils className="h-4 w-4" /> },
    { label: "Gym", value: "Gym", icon: <Dumbbell className="h-4 w-4" /> },
    { label: "Spa", value: "Spa", icon: <Bath className="h-4 w-4" /> },
  ];
  
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "Free Wi-Fi":
        return <Wifi className="h-3 w-3" />;
      case "Breakfast Included":
        return <Coffee className="h-3 w-3" />;
      case "Restaurant":
        return <Utensils className="h-3 w-3" />;
      case "Gym":
        return <Dumbbell className="h-3 w-3" />;
      case "Spa":
        return <Bath className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      {/* Search summary */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            {searchParams?.location ? `Hotels in ${searchParams.location}` : "Hotel Results"}
          </h1>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </div>
        
        {searchParams && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground">
              {searchParams.location && `Location: ${searchParams.location}`}
              {searchParams.guests && ` • Guests: ${searchParams.guests}`}
              {(searchParams.checkIn && searchParams.checkOut) && 
                ` • Dates: ${searchParams.checkIn} to ${searchParams.checkOut}`}
              {(searchParams.priceMin && searchParams.priceMax) && 
                ` • Price: ₹${searchParams.priceMin} - ₹${searchParams.priceMax}`}
            </p>
          </div>
        )}
      </div>
      
      {/* Filters section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-medium">
            {filteredHotels.length} {filteredHotels.length === 1 ? "hotel" : "hotels"} found
          </h2>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 animate-fade-in">
            <div className="mb-6">
              <h3 className="font-medium mb-2">Price Range (₹)</h3>
              <div className="px-2">
                <Slider 
                  defaultValue={priceRange}
                  min={1000}
                  max={20000}
                  step={500}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="my-6"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filterOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={option.value} 
                      checked={selectedFilters.includes(option.value)}
                      onCheckedChange={() => toggleFilter(option.value)}
                    />
                    <Label htmlFor={option.value} className="flex items-center gap-1 text-sm cursor-pointer">
                      {option.icon}
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hotel results */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2">Searching for hotels...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div key={hotel.id} className="hotel-card">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-medium">
                    ₹{hotel.price}/night
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-medium text-lg">{hotel.name}</h3>
                    <div className="flex items-center text-amber-500">
                      <Star className="fill-amber-500 h-4 w-4" />
                      <span className="ml-1 text-sm">{hotel.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {hotel.location}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hotel.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={`${hotel.id}-${tag}`} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-xs rounded-full"
                      >
                        {getTagIcon(tag)}
                        {tag}
                      </span>
                    ))}
                    {hotel.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-xs rounded-full">
                        +{hotel.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleBookNow(hotel)} 
                    className="w-full"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8">
              <div className="text-4xl mb-4">🏨</div>
              <h3 className="font-heading text-xl font-medium mb-2">No hotels found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your filters or search for hotels in another location.
              </p>
              <Button onClick={() => navigate("/")}>Search Again</Button>
            </div>
          )}
        </div>
      )}
      
      {/* Booking summary dialog */}
      {selectedHotel && (
        <BookingSummary 
          hotel={selectedHotel} 
          searchParams={searchParams} 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};

export default HotelResults;
