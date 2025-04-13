
import { SearchParams } from "@/types";

// This should be stored securely. For production, use server-side API or secrets management
const GEMINI_API_KEY = "AIzaSyA83h1LJnOlGFK1oavFozCYwmL25S452yg"; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
  // In a real app, this would call the Gemini API to get hotel suggestions
  // For now, we'll return mock data
  const mockHotels = generateMockHotels(searchParams);
  return mockHotels;
}

function generateMockHotels(searchParams: SearchParams) {
  // Generate 10 mock hotels based on search parameters
  const hotels = [];
  const locations = ["Goa", "Mumbai", "Delhi", "Bangalore", "Jaipur", "Udaipur", "Chennai", "Kolkata"];
  const tags = ["Sea View", "Free Wi-Fi", "Swimming Pool", "Breakfast Included", "Spa", "Gym", "Restaurant", "Bar"];
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

  for (let i = 1; i <= 10; i++) {
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
      name: `${["Luxury", "Sunset", "Ocean", "Royal", "Grand", "Elite"][Math.floor(Math.random() * 6)]} Hotel ${i}`,
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
