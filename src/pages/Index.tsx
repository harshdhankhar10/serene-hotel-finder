
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processSearchQuery } from '@/services/aiService';
import { saveSearchParams } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Find Your Perfect Stay with <span className="ai-gradient-text">AI Assistance</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe what you're looking for in natural language, and our AI will find the perfect hotel for you.
          </p>
        </div>
        
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl transform -rotate-1 scale-105 opacity-70"></div>
          <div className="relative bg-white p-8 rounded-2xl shadow-sm">
            <div className="flex items-center mb-4">
              <Sparkles className="text-primary h-5 w-5 mr-2" />
              <span className="text-sm font-medium text-primary">Powered by Gemini AI</span>
            </div>
            
            <div className="relative">
              <Input
                type="text"
                placeholder="Find hotels like '3-star hotel in Goa for 2 people under ₹4000 near the beach'"
                className="w-full pl-4 pr-12 py-6 text-lg rounded-xl border-2 border-slate-200 focus:border-primary"
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
            
            <Button 
              onClick={handleSearch} 
              className="w-full mt-4 py-6 text-lg font-medium rounded-xl"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <span className="animate-pulse-slow mr-2">Processing your search</span>
                  <Sparkles className="h-5 w-5 animate-pulse-slow" />
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
                {["Luxury hotel with ocean view in Goa", "Budget hotel in Mumbai for family", "Pet-friendly hotels in Bangalore"].map((example) => (
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
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2">AI-Powered Search</h3>
            <p className="text-sm text-muted-foreground">Describe your ideal stay in natural language, and our AI will understand exactly what you need.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Search className="text-primary h-5 w-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2">Personalized Results</h3>
            <p className="text-sm text-muted-foreground">Get hotel recommendations personalized to your preferences, budget, and desired location.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Mic className="text-primary h-5 w-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2">Voice Search</h3>
            <p className="text-sm text-muted-foreground">Speak your hotel preferences naturally and let our AI find the perfect match for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
