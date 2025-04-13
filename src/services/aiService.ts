
import { Hotel, SearchParams } from "@/types";

// This should be stored securely. For production, use server-side API or secrets management
const GEMINI_API_KEY = "AIzaSyA83h1LJnOlGFK1oavFozCYwmL25S452yg"; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const HOTELS_API_KEY = "d9b8c5d0a3msh5ea2981f0a3d6a3p1fa7e5jsn7a02e83297c7"; // This is a temporary key for demonstration
const HOTELS_API_HOST = "hotels-com-provider.p.rapidapi.com";

export async function processSearchQuery(query: string): Promise<SearchParams> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract search parameters from this hotel search query: "${query}". 
                Return a JSON object with these fields if present in the query: 
                location, checkIn (date), checkOut (date), guests (number), 
                priceMin (number), priceMax (number), amenities (array of strings).
                Format in valid JSON with no additional text.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
        }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error.message || "Failed to process search query");
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (in case there's any extra text)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
    
    // Parse the extracted JSON
    const parsedData = JSON.parse(jsonStr);
    
    return {
      query,
      ...parsedData
    };
  } catch (error) {
    console.error("Error processing search query:", error);
    // Return basic search parameters with original query
    return { query };
  }
}

export async function getHotelSuggestions(searchParams: SearchParams) {
  try {
    // If no location is provided, use Gemini to extract one from the query
    let location = searchParams.location;
    if (!location && searchParams.query) {
      // Try to extract location from the query using Gemini
      location = await extractLocationFromQuery(searchParams.query);
    }
    
    // Default to a popular destination if location still not available
    location = location || "New York";
    
    // Format check-in and check-out dates or use default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const checkIn = searchParams.checkIn || formatDate(tomorrow);
    const checkOut = searchParams.checkOut || formatDate(nextWeek);
    
    // Format dates for API (YYYY-MM-DD)
    function formatDate(date: Date): string {
      return date.toISOString().split('T')[0];
    }

    console.log(`Searching for hotels in ${location}`);

    // Get location ID first
    const locationIdResponse = await fetch(`https://${HOTELS_API_HOST}/locations/v2/search?query=${encodeURIComponent(location)}&locale=en_US&currency=USD`, {
      method: "GET",
      headers: {
        'X-RapidAPI-Key': HOTELS_API_KEY,
        'X-RapidAPI-Host': HOTELS_API_HOST
      }
    });

    const locationData = await locationIdResponse.json();
    
    if (!locationData.suggestions || locationData.suggestions.length === 0) {
      console.error("No location data found");
      return await getAIGeneratedHotels(searchParams, location);
    }
    
    // Find the first city or region suggestion
    const locationSuggestion = locationData.suggestions.find((suggestion: any) => 
      suggestion.group === "CITY_GROUP" || suggestion.group === "REGION_GROUP"
    );
    
    if (!locationSuggestion || !locationSuggestion.entities || locationSuggestion.entities.length === 0) {
      console.error("No valid location entities found");
      return await getAIGeneratedHotels(searchParams, location);
    }
    
    const locationId = locationSuggestion.entities[0].destinationId;
    
    // Now search for hotels with the location ID
    const hotelSearchResponse = await fetch(`https://${HOTELS_API_HOST}/properties/list?destinationId=${locationId}&checkIn=${checkIn}&checkOut=${checkOut}&adults1=1&locale=en_US&currency=USD`, {
      method: "GET",
      headers: {
        'X-RapidAPI-Key': HOTELS_API_KEY,
        'X-RapidAPI-Host': HOTELS_API_HOST
      }
    });
    
    const hotelData = await hotelSearchResponse.json();
    
    if (!hotelData.data || !hotelData.data.body || !hotelData.data.body.searchResults || !hotelData.data.body.searchResults.results) {
      console.error("No hotel data found");
      return await getAIGeneratedHotels(searchParams, location);
    }
    
    // Map API results to our Hotel format
    const hotels: Hotel[] = hotelData.data.body.searchResults.results
      .slice(0, 10) // Limit to 10 hotels
      .map((hotel: any) => {
        // Extract amenities/tags
        const amenities = hotel.amenities ? 
          hotel.amenities.slice(0, 5).map((amenity: any) => amenity.name || "").filter(Boolean) : 
          ["Free Wi-Fi", "Parking"];
          
        // Get price
        const price = hotel.ratePlan && hotel.ratePlan.price ? 
          Number(hotel.ratePlan.price.current.replace(/[^0-9.]/g, '')) : 
          (5000 + Math.floor(Math.random() * 5000));
          
        // Get image
        const image = hotel.optimizedThumbUrls && hotel.optimizedThumbUrls.srpDesktop ? 
          hotel.optimizedThumbUrls.srpDesktop : 
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000";
          
        return {
          id: `hotel-${hotel.id || Math.random().toString(36).substring(2, 10)}`,
          name: hotel.name || "Luxury Hotel",
          location: hotel.address ? 
            `${hotel.address.streetAddress || ""}, ${hotel.address.locality || ""}, ${hotel.address.region || ""}`.trim() : 
            location,
          price: price,
          rating: hotel.starRating || (3 + Math.random() * 2),
          image: image,
          tags: amenities,
          description: hotel.neighbourhood || "Experience luxury and comfort at our prime location with stunning views and excellent service."
        };
      });
      
    return hotels;
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return getAIGeneratedHotels(searchParams, searchParams.location || "popular destination");
  }
}

// Use Gemini to extract location from the query
async function extractLocationFromQuery(query: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract only the location name from this hotel search query: "${query}". 
                Return just the location name, nothing else. If no location is found, return "null".`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
        }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      return null;
    }

    const textResponse = data.candidates[0].content.parts[0].text.trim();
    return textResponse === "null" ? null : textResponse;
  } catch (error) {
    console.error("Error extracting location:", error);
    return null;
  }
}

// Generate realistic hotel data using Gemini AI when API fails
async function getAIGeneratedHotels(searchParams: SearchParams, location: string): Promise<Hotel[]> {
  console.log("Generating AI hotels for", location);
  try {
    // First try to get real hotel data using Gemini
    const hotelData = await generateHotelDataWithGemini(searchParams, location);
    if (hotelData && hotelData.length > 0) {
      return hotelData;
    }
    
    // Fall back to mock data if Gemini fails
    return generateMockHotels(searchParams);
  } catch (error) {
    console.error("Error generating AI hotels:", error);
    return generateMockHotels(searchParams);
  }
}

async function generateHotelDataWithGemini(searchParams: SearchParams, location: string): Promise<Hotel[]> {
  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate 5 realistic hotels in ${location}. 
                Return a JSON array with hotels having these properties:
                {
                  "name": (real hotel name),
                  "location": (detailed address in ${location}),
                  "price": (realistic price number between ${searchParams.priceMin || 1500} and ${searchParams.priceMax || 15000}),
                  "rating": (number between 3 and 5),
                  "tags": (array of 3-5 realistic amenities),
                  "description": (short description of the hotel)
                }
                Return just the JSON array without any additional text.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      return [];
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (in case there's any extra text)
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const jsonStr = jsonMatch[0];
    
    // Parse the extracted JSON
    const parsedData = JSON.parse(jsonStr);
    
    // Transform the data to match our Hotel type
    const hotelImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000",
    ];
    
    return parsedData.map((hotel: any, index: number) => ({
      id: `hotel-ai-${index}`,
      name: hotel.name,
      location: hotel.location,
      price: parseInt(hotel.price),
      rating: parseFloat(hotel.rating),
      image: hotelImages[index % hotelImages.length],
      tags: hotel.tags || ["Free Wi-Fi", "Room Service", "Restaurant"],
      description: hotel.description
    }));
    
  } catch (error) {
    console.error("Error generating hotels with Gemini:", error);
    return [];
  }
}

// Fallback mock data generator
function generateMockHotels(searchParams: SearchParams) {
  console.log("Falling back to mock hotel data");
  // Generate 10 mock hotels based on search parameters
  const hotels = [];
  // Real hotel names
  const hotelNames = [
    "The Ritz-Carlton", "Four Seasons Hotel", "Marriott Hotel", "Hilton Garden Inn", 
    "Hyatt Regency", "Sheraton Grand", "InterContinental", "Mandarin Oriental",
    "The Peninsula", "W Hotel", "St. Regis", "JW Marriott", "Westin", "Waldorf Astoria"
  ];
  const locations = ["Goa", "Mumbai", "Delhi", "Bangalore", "Jaipur", "Udaipur", "Chennai", "Kolkata"];
  const tags = ["Free Wi-Fi", "Swimming Pool", "Breakfast Included", "Spa", "Gym", "Restaurant", "Bar", "Room Service"];
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000",
  ];

  // Use location from search params or pick random
  const location = searchParams.location || locations[Math.floor(Math.random() * locations.length)];
  
  // Use price range from search params or default
  const minPrice = searchParams.priceMin || 1500;
  const maxPrice = searchParams.priceMax || 10000;

  for (let i = 0; i < 10; i++) {
    const randomTags = [];
    const numTags = 2 + Math.floor(Math.random() * 3); // 2-4 tags
    
    // Generate random tags
    for (let j = 0; j < numTags; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (!randomTags.includes(randomTag)) {
        randomTags.push(randomTag);
      }
    }

    // Add amenities from search params if available
    if (searchParams.amenities && searchParams.amenities.length > 0) {
      for (const amenity of searchParams.amenities) {
        if (!randomTags.includes(amenity)) {
          randomTags.push(amenity);
        }
      }
    }

    // Generate random price within range
    const price = Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
    
    hotels.push({
      id: `hotel-${i}`,
      name: hotelNames[Math.floor(Math.random() * hotelNames.length)],
      location: location,
      price: price,
      rating: 3 + Math.random() * 2, // 3-5 rating
      image: images[Math.floor(Math.random() * images.length)],
      tags: randomTags,
      description: "Experience luxury and comfort at our prime location with stunning views and excellent service.",
    });
  }

  return hotels;
}
