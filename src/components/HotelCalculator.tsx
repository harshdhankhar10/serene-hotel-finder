
import { useState, useEffect } from 'react';
import { Calculator, DollarSign, CreditCard, IndianRupee, Euro, PoundSterling, Japanese, Yen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Currency } from '@/types';

interface HotelCalculatorProps {
  defaultCurrency?: string;
}

const currencies: Record<string, Currency> = {
  INR: { code: 'INR', symbol: '₹', rate: 1 },
  USD: { code: 'USD', symbol: '$', rate: 0.012 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095 },
  JPY: { code: 'JPY', symbol: '¥', rate: 1.83 },
};

const HotelCalculator = ({ defaultCurrency = 'INR' }: HotelCalculatorProps) => {
  const [nights, setNights] = useState(3);
  const [roomRate, setRoomRate] = useState(3000);
  const [meals, setMeals] = useState(1000);
  const [transport, setTransport] = useState(500);
  const [activities, setActivities] = useState(1500);
  const [currencyCode, setCurrencyCode] = useState(defaultCurrency);
  
  // Get user's location and set currency based on that
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // This is a simple way to get country from browser language
        // In a real app, you might use a geolocation API
        const language = navigator.language;
        const country = language.split('-')[1]?.toUpperCase();
        
        if (country === 'IN') setCurrencyCode('INR');
        else if (country === 'US') setCurrencyCode('USD');
        else if (country === 'GB') setCurrencyCode('GBP');
        else if (country === 'JP') setCurrencyCode('JPY');
        else if (['DE', 'FR', 'IT', 'ES'].includes(country)) setCurrencyCode('EUR');
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };
    
    getUserLocation();
  }, []);
  
  const currency = currencies[currencyCode];
  
  // Convert values to selected currency for display
  const convertAmount = (amount: number): number => {
    return parseFloat((amount * currency.rate).toFixed(2));
  };
  
  // Calculate totals in the current currency
  const roomTotal = nights * roomRate;
  const mealsTotal = nights * meals;
  const total = roomTotal + mealsTotal + transport + activities;
  
  // Display values in selected currency
  const displayRoomRate = convertAmount(roomRate);
  const displayMeals = convertAmount(meals);
  const displayTransport = convertAmount(transport);
  const displayActivities = convertAmount(activities);
  const displayRoomTotal = convertAmount(roomTotal);
  const displayMealsTotal = convertAmount(mealsTotal);
  const displayTotal = convertAmount(total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-medium text-lg flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Trip Budget Calculator
        </h3>
        <Select value={currencyCode} onValueChange={setCurrencyCode}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">₹ INR</SelectItem>
            <SelectItem value="USD">$ USD</SelectItem>
            <SelectItem value="EUR">€ EUR</SelectItem>
            <SelectItem value="GBP">£ GBP</SelectItem>
            <SelectItem value="JPY">¥ JPY</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Number of Nights</Label>
              <span className="text-sm font-medium">{nights} nights</span>
            </div>
            <Slider
              value={[nights]}
              min={1}
              max={14}
              step={1}
              onValueChange={(value) => setNights(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Room Rate (per night)</Label>
              <span className="text-sm font-medium">{currency.symbol}{displayRoomRate}</span>
            </div>
            <Slider
              value={[roomRate]}
              min={500}
              max={10000}
              step={100}
              onValueChange={(value) => setRoomRate(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Meals (per day)</Label>
              <span className="text-sm font-medium">{currency.symbol}{displayMeals}</span>
            </div>
            <Slider
              value={[meals]}
              min={0}
              max={5000}
              step={100}
              onValueChange={(value) => setMeals(value[0])}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Transport Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency.symbol}
              </span>
              <Input
                type="number"
                value={transport}
                onChange={(e) => setTransport(parseInt(e.target.value) || 0)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Activities & Entertainment</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency.symbol}
              </span>
              <Input
                type="number"
                value={activities}
                onChange={(e) => setActivities(parseInt(e.target.value) || 0)}
                className="pl-8 w-full"
              />
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Room Charges ({nights} nights)</span>
              <span className="font-medium">{currency.symbol}{displayRoomTotal}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Meals ({nights} days)</span>
              <span className="font-medium">{currency.symbol}{displayMealsTotal}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Transport</span>
              <span className="font-medium">{currency.symbol}{displayTransport}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Activities</span>
              <span className="font-medium">{currency.symbol}{displayActivities}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center font-bold">
              <span>Total Budget</span>
              <span className="text-primary text-lg">{currency.symbol}{displayTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCalculator;
