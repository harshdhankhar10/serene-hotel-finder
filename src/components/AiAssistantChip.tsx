import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, PenLine, Search, CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { processSearchQuery, getHotelSuggestions } from "@/services/aiService";
import { saveSearchParams } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";
import { Hotel, SearchParams } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  searchResults?: Hotel[];
}

const AiAssistantChip = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("ai_assistant_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Hello! I'm your AI travel assistant. How can I help you find the perfect hotel?",
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
      localStorage.setItem("ai_assistant_messages", JSON.stringify([initialMessage]));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ai_assistant_messages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      if (inputValue.toLowerCase().includes("hotel") || 
          inputValue.toLowerCase().includes("stay") || 
          inputValue.toLowerCase().includes("book") ||
          inputValue.toLowerCase().includes("room")) {
        
        const searchParams = await processSearchQuery(inputValue);
        const hotels = await getHotelSuggestions(searchParams);
        saveSearchParams(searchParams);
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 100}`,
          role: "assistant",
          content: `I found ${hotels.length} hotels based on your search. Here are some options${searchParams.location ? ` in ${searchParams.location}` : ''}:`,
          timestamp: new Date().toISOString(),
          searchResults: hotels.slice(0, 3),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setTimeout(() => {
          const responses = [
            "I can help you find hotels, plan your trip, or answer questions about destinations. What kind of accommodation are you looking for?",
            "Do you have any specific requirements for your stay, like a swimming pool, beach access, or proximity to attractions?",
            "I'd be happy to suggest some hotels based on your preferences. Just let me know what you're looking for.",
            "Tell me about your travel plans and I'll help you find the perfect hotel.",
            "If you're not sure where to start, try asking something like 'Find me a 3-star hotel in Goa for 2 people under ₹4000'."
          ];
          
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 100}`,
            role: "assistant",
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 100}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: "Hello! I'm your AI travel assistant. How can I help you find the perfect hotel?",
      timestamp: new Date().toISOString(),
    };
    
    setMessages([initialMessage]);
    localStorage.setItem("ai_assistant_messages", JSON.stringify([initialMessage]));
    
    toast({
      title: "Chat Cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const handleViewHotelResults = (searchResults?: Hotel[]) => {
    if (!searchResults || searchResults.length === 0) return;
    
    navigate('/results');
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className={cn(
              "rounded-full shadow-lg flex items-center gap-2 transition-all duration-300",
              isExpanded ? "w-auto px-4" : "w-12 h-12 p-0"
            )}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
          >
            <Bot className="h-5 w-5" />
            {isExpanded && <span>Ask AI Assistant</span>}
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>Gemini AI Assistant</span>
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={handleClearChat}
              >
                Clear Chat
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-4 flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto p-4 rounded-md bg-slate-50 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-xl max-w-[80%]",
                    message.role === 'assistant' 
                      ? "bg-white rounded-tl-none" 
                      : "bg-primary text-white rounded-tr-none"
                  )}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.searchResults && message.searchResults.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.searchResults.map((hotel) => (
                          <div key={hotel.id} className="bg-slate-50 p-2 rounded-lg text-slate-900 text-xs">
                            <div className="flex mb-1">
                              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-2">
                                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{hotel.name}</p>
                                <p className="text-xs text-slate-500">{hotel.location}</p>
                                <p className="font-medium">₹{hotel.price}/night</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          size="sm" 
                          className="w-full mt-2 text-xs h-7 gap-1"
                          onClick={() => handleViewHotelResults(message.searchResults)}
                        >
                          <Search className="h-3 w-3" />
                          View All Results
                        </Button>
                      </div>
                    )}
                    
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <PenLine className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about hotels, destinations, or amenities..."
                className="w-full rounded-full border border-input px-4 py-2 pr-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1 h-7 w-7 rounded-full p-0"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
              >
                {isProcessing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AiAssistantChip;
