import React, { useState } from 'react';
import { PlanProfile } from '../../utils/budgetEngine';

interface ConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanProfile;
}

interface Message {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: string;
}

export const ConciergeModal: React.FC<ConciergeModalProps> = ({ isOpen, onClose, plan }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'concierge',
      text: `Namaste! I'm your EventEase Celebration Concierge for "${plan.name}". I can help you negotiate with vendors in ${plan.city}, re-time auspicious Muhurats, or ensure elder and toddler comfort. What would you like assistance with?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I negotiate the catering live counter quote?',
    'What is the ideal Muhurat timing for cake cutting?',
    'How can we cut 10% budget without compromising decor?',
    'What elder care comfort measures should I verify with the venue?',
  ];

  const handleSendPrompt = async (promptText: string) => {
    const userMsg: Message = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const history = messages.map((m) => ({ role: m.sender, text: m.text }));
      const res = await fetch('/api/concierge-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          plan,
          history,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: 'c_' + Date.now(),
        sender: 'concierge',
        text: data.reply || `Namaste! For ${plan.city}, always negotiate packages and request complimentary items like live chaat or mocktail dispensers.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Concierge chat API fallback:', err);
      const fallbackMsg: Message = {
        id: 'c_' + Date.now(),
        sender: 'concierge',
        text: `Based on your ${plan.type} celebration in ${plan.city}: We recommend securing your venue 4 months in advance and maintaining acoustic limits (<70dB) near elder seating.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendPrompt(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#FFF9F2] border border-[#E3D5CA] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#7A1E3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2A9D8F] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-xl">chat</span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-base leading-snug">
                EventEase Celebration Concierge
              </h2>
              <p className="text-[11px] text-[#FFD9DF]">
                Live advice for {plan.city} · Indian traditions & vendor negotiations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#7A1E3A] text-white rounded-br-xs shadow-xs'
                    : 'bg-white border border-[#E3D5CA] text-[#1B1C1C] rounded-bl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-[#5E514D] px-1 mt-0.5">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-white border border-[#E3D5CA] rounded-2xl max-w-xs text-xs text-[#5E514D]">
              <span className="w-2 h-2 rounded-full bg-[#7A1E3A] animate-ping" />
              <span>Concierge is formulating advice...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-4 py-2 bg-[#FAF3EB] border-t border-[#E3D5CA]/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendPrompt(p)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E3D5CA] text-[11px] text-[#7A1E3A] font-semibold whitespace-nowrap hover:bg-[#FFD9DF]/40 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E3D5CA] flex gap-2">
          <input
            type="text"
            placeholder="Ask about caterers, muhurats, decor packages..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#FAF3EB] border border-[#E3D5CA] rounded-xl text-xs focus:outline-none focus:border-[#7A1E3A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#7A1E3A] text-white text-xs font-semibold hover:bg-[#5C0325] transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
