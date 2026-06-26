import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, X, Bot, User, Trash2, ArrowRight } from "lucide-react";
import { ChatMessage } from "../types";

interface AiStylistProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiStylist({ isOpen, onClose }: AiStylistProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "stylist",
      text: "Welcome to the Muskan Nazar Luxury Atelier. I am your personal AI Stylist Concierge. I am deeply knowledgeable about classical South Asian craftsmanship, custom draping, and our signature bridal silhouettes. What celebratory occasion are we designing for today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10) // Send trailing conversation context
        })
      });

      const data = await response.json();
      const botText = data.text || "I am currently adjusting my design blueprints. Please ask me again shortly, or consult our Bespoke Suite.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "stylist",
          text: botText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "stylist",
          text: "My apologies. There was a brief connectivity disturbance. How may I assist you with sizing, bridal designs, or worldwide shipping specifications?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggest = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "stylist",
        text: "I have cleared our design notes. How can I guide your couture selections today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestedPrompts = [
    "Explain zardozi embroidery",
    "Help me pick a bridal lehenga",
    "What is the shipping timeline?",
    "How do custom measurements work?"
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#FCFBFA] border-l border-[#eae6db] shadow-2xl z-50 flex flex-col justify-between select-none animate-slide-in">
      
      {/* Drawer Header */}
      <div className="p-5 border-b border-[#eae6db] bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#111] flex justify-center items-center">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-[13px] uppercase tracking-[0.2em] font-bold text-gray-900 leading-none">
              AI Stylist Concierge
            </h3>
            <span className="font-mono text-[8px] text-amber-700 tracking-[0.3em] uppercase block mt-1">Muskan Nazar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearChat}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
            title="Clear design notes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 border border-gray-100 rounded-full text-gray-500 hover:bg-black hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#faf9f6]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest">
                {msg.sender === "user" ? "Client" : "Stylist"}
              </span>
              <span className="text-[8px] text-gray-300 font-mono">{msg.timestamp}</span>
            </div>
            
            <div
              className={`max-w-[85%] rounded-sm p-3.5 text-xs font-sans tracking-wide leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-[#111] text-white rounded-tr-none"
                  : "bg-white text-gray-800 border border-[#eae6db] rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest mb-1">Stylist</span>
            <div className="bg-white border border-[#eae6db] rounded-sm rounded-tl-none p-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce delay-200"></span>
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Area */}
      {messages.length === 1 && (
        <div className="p-4 bg-white border-t border-[#eae6db] space-y-2">
          <span className="font-mono text-[8px] text-gray-400 tracking-[0.25em] uppercase block">Suggested consult topics</span>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((sp) => (
              <button
                key={sp}
                onClick={() => handleSuggest(sp)}
                className="p-2.5 text-left border border-[#eae6db] hover:border-[#aa7c11] bg-[#fcfbfa] hover:bg-white text-[10px] text-gray-700 tracking-wide font-sans rounded-sm transition-all duration-300 flex justify-between items-center group"
              >
                <span>{sp}</span>
                <ArrowRight className="w-3 h-3 text-amber-600 transform group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer input form */}
      <div className="p-4 border-t border-[#eae6db] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="flex items-center gap-2 border border-[#eae6db] p-1 focus-within:border-black transition-colors"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Discuss bridal custom measurements, fabrics..."
            className="flex-1 bg-transparent px-3 py-2 text-xs font-sans text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 bg-[#111] text-white hover:bg-[#aa7c11] transition-colors rounded-sm"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
