
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, MessageSquare, Volume2, Sparkles, Send, Keyboard } from 'lucide-react';
import { Button } from './Button';

interface AIAssistantProps {
  onNavigate: (view: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState("Hello! I'm Nora, your travel guide. How can I help you?");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm Nora. Ask me anything about your trip or the system status." }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const processCommand = (text: string) => {
    const lower = text.toLowerCase();
    let response = "I'm not sure I understand. Try asking to 'book a ticket' or 'check status'.";
    
    // Simple intent matching
    if (lower.includes('book') || lower.includes('ticket') || lower.includes('travel')) {
      response = "Opening the booking page for you now. Where would you like to go?";
      onNavigate('search');
    } else if (lower.includes('status') || lower.includes('my ticket') || lower.includes('wallet')) {
      response = "Checking your records... showing your active tickets.";
      onNavigate('my-bookings');
    } else if (lower.includes('price') || lower.includes('cost')) {
      response = "Prices for Kigali to Musanze start at 3,500 Francs. Would you like to see the schedule?";
      onNavigate('search');
    } else if (lower.includes('dashboard') || lower.includes('admin') || lower.includes('fleet')) {
      response = "Accessing secure command center.";
      onNavigate('dashboard');
    } else if (lower.includes('staff') || lower.includes('driver')) {
      response = "Opening staff management portal.";
      onNavigate('staff');
    } else if (lower.includes('system') || lower.includes('revenue')) {
      response = "Opening system overwatch dashboard.";
      onNavigate('system-dashboard');
    }

    // Add interactions to history
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', text },
      { role: 'ai', text: response }
    ]);

    setAiResponse(response);
    speak(response);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1.1; 
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female'));
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    processCommand(inputText);
    setInputText('');
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Mock recognition end
      processCommand(transcript || "Show me my dashboard");
      setTranscript("");
    } else {
      setIsListening(true);
      setTranscript("");
      speak("I'm listening...");
      
      // Mock speech recognition interaction
      setTimeout(() => {
        setTranscript("Take me to fleet management");
      }, 1500);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => { setIsOpen(true); speak("Hello! How can I help?"); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-[0_0_30px_rgba(0,220,130,0.4)] flex items-center justify-center text-black hover:scale-110 transition-transform duration-300 animate-float"
        >
          <Sparkles size={24} fill="currentColor" />
        </button>
      )}

      {/* AI Interface Overlay */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-[380px] h-[500px] sm:h-auto sm:max-h-[600px] glass-panel-heavy sm:rounded-3xl border-t sm:border border-primary/30 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 flex items-center justify-between border-b border-white/5 shrink-0">
             <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-primary animate-pulse' : 'bg-gray-500'}`}></div>
               <span className="font-display font-bold text-lg tracking-wide">NORA AI</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          {/* Visualizer Area */}
          <div className="h-32 bg-black/50 relative flex items-center justify-center overflow-hidden shrink-0">
             {/* Holographic Orb */}
             <div className={`absolute w-32 h-32 rounded-full bg-primary/20 blur-3xl transition-all duration-500 ${isSpeaking ? 'scale-150 opacity-80' : 'scale-100 opacity-40'}`}></div>
             <div className={`relative z-10 w-16 h-16 rounded-full border-2 border-primary/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,220,130,0.5)] ${isSpeaking ? 'animate-pulse' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                   <Sparkles className={`text-primary ${isSpeaking ? 'animate-spin-slow' : ''}`} size={24} />
                </div>
             </div>
             
             {/* Waveforms */}
             {isSpeaking && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-end h-8">
                 {[1,2,3,4,5,4,3,2].map((i, idx) => (
                   <div key={idx} className="w-1 bg-primary rounded-full animate-wave" style={{ animationDelay: `${idx * 0.1}s` }}></div>
                 ))}
               </div>
             )}
          </div>

          {/* Chat History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
             {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary/20 text-white border border-primary/20 rounded-tr-sm' 
                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm'
                   }`}>
                      {msg.text}
                   </div>
                </div>
             ))}
             {transcript && (
               <div className="flex justify-end">
                  <div className="bg-white/5 text-gray-400 italic rounded-2xl p-3 text-xs border border-white/5">
                     Scanning: "{transcript}"...
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 bg-black/20 border-t border-white/5 shrink-0">
             <form onSubmit={handleSendText} className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
                <Button type="submit" size="sm" variant="primary" className="rounded-xl px-3" disabled={!inputText.trim()}>
                   <Send size={16} />
                </Button>
             </form>
             
             <div className="flex items-center justify-center">
               <button 
                  type="button"
                  onClick={toggleListening}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                     isListening 
                        ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
               >
                  {isListening ? <><Volume2 size={16} className="animate-pulse" /> Listening...</> : <><Mic size={16}/> Tap to Speak</>}
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
