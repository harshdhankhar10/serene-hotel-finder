
import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface HotelCalculatorProps {
  currency?: string;
}

const HotelCalculator = ({ currency = '₹' }: HotelCalculatorProps) => {
  const [nights, setNights] = useState(3);
  const [roomRate, setRoomRate] = useState(3000);
  const [meals, setMeals] = useState(1000);
  const [transport, setTransport] = useState(500);
  const [activities, setActivities] = useState(1500);
  
  // Calculate totals
  const roomTotal = nights * roomRate;
  const mealsTotal = nights * meals;
  const total = roomTotal + mealsTotal + transport + activities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-medium text-lg flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Trip Budget Calculator
        </h3>
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
              <span className="text-sm font-medium">{currency}{roomRate}</span>
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
              <span className="text-sm font-medium">{currency}{meals}</span>
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
            <Input
              type="number"
              value={transport}
              onChange={(e) => setTransport(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Activities & Entertainment</Label>
            <Input
              type="number"
              value={activities}
              onChange={(e) => setActivities(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Room Charges ({nights} nights)</span>
              <span className="font-medium">{currency}{roomTotal}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Meals ({nights} days)</span>
              <span className="font-medium">{currency}{mealsTotal}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Transport</span>
              <span className="font-medium">{currency}{transport}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Activities</span>
              <span className="font-medium">{currency}{activities}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between items-center font-bold">
              <span>Total Budget</span>
              <span className="text-primary text-lg">{currency}{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCalculator;
