
import { useState } from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const AiAssistantChip = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet>
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
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>Gemini AI Assistant</span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto p-4 rounded-md bg-slate-50 mb-4">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm">Hello! I'm your AI travel assistant. How can I help you find the perfect hotel?</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about hotels, destinations, or amenities..."
                className="w-full rounded-full border border-input px-4 py-2 pr-10"
              />
              <Button size="sm" className="absolute right-1 top-1 h-7 w-7 rounded-full p-0">
                <Bot className="h-4 w-4" />
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
