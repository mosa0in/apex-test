import React, { useState, useRef, useEffect } from 'react';
import { X, SmartToy, Lightbulb, Search, Extension, CheckCircle, HelpCircle, PsychologyAlt, Category, ArrowRight } from './icons';
import { isAIAvailable } from '../services/ai';

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCoachSelect: (helpType: string) => void;
  onSelectStrategy: (strategy: string) => void;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  options?: 'main' | 'strategies';
}

export default function CoachPanel({ isOpen, onClose, onCoachSelect, onSelectStrategy }: CoachPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset chat when panel opens
  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  const addBotMessage = (text: string, options?: 'main' | 'strategies') => {
    msgIdRef.current++;
    setMessages(prev => [...prev, { id: msgIdRef.current, text, isUser: false, options }]);
  };

  const addUserMessage = (text: string) => {
    msgIdRef.current++;
    setMessages(prev => [...prev, { id: msgIdRef.current, text, isUser: true }]);
  };

  const hideAllOptions = () => {
    setMessages(prev => prev.map(m => ({ ...m, options: undefined })));
  };

  const initChat = () => {
    msgIdRef.current = 0;
    setMessages([]);
    setIsTyping(false);
    setTimeout(() => {
      msgIdRef.current++;
      setMessages([{
        id: msgIdRef.current,
        text: 'أهلاً بك! أنا الكوتش الخاص بك. كيف يمكنني مساعدتك اليوم في حل هذا التدريب؟',
        isUser: false,
        options: 'main',
      }]);
    }, 300);
  };

  const handleMainOption = (text: string, type: string) => {
    hideAllOptions();
    addUserMessage(text);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (type === 'methods') {
        addBotMessage('فهمتك تماماً! إليك بعض الطرق الممتعة والمختلفة التي يمكننا استخدامها معاً لتسهيل المعلومة:', 'strategies');
      } else {
        // For start, concept, difficulty → call AI coach or strategies
        onCoachSelect(type);
      }
    }, 800);
  };

  const handleStrategySelect = (name: string, strategy: string) => {
    hideAllOptions();
    addUserMessage(name);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(`اختيار رائع! لنبدأ بـ ${name}...`);
      setTimeout(() => {
        onSelectStrategy(strategy);
      }, 500);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[90] lg:bg-transparent lg:backdrop-blur-none"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="coach-panel fixed top-0 left-0 h-full z-[95] flex flex-col"
        style={{ animation: 'coach-slide-in 0.35s ease-out' }}
      >
        {/* Header */}
        <div className="coach-panel-header">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-bright/40 transition-all"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-sm text-on-surface">الكوتش الذكي</p>
              <p className="text-[10px] text-primary flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                {isAIAvailable() ? 'AI متصل' : 'متصل الآن'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <SmartToy className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={chatRef} className="coach-chat-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`coach-message ${msg.isUser ? 'coach-msg-user' : 'coach-msg-bot'}`}>
              <div className={`coach-bubble ${msg.isUser ? 'coach-bubble-user' : 'coach-bubble-bot'}`}>
                {msg.text}
              </div>

              {/* Main Options */}
              {msg.options === 'main' && (
                <div className="coach-options-grid">
                  <button className="coach-option-btn" onClick={() => handleMainOption('مش عارف أبدأ الحل', 'start')}>
                    <span>مش عارف أبدأ الحل</span>
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </button>
                  <button className="coach-option-btn" onClick={() => handleMainOption('في جزئية مش فاهمها', 'concept')}>
                    <span>في جزئية مش فاهمها</span>
                    <PsychologyAlt className="w-4 h-4 text-primary" />
                  </button>
                  <button className="coach-option-btn" onClick={() => handleMainOption('السؤال صعب عليّ', 'difficulty')}>
                    <span>السؤال صعب عليّ</span>
                    <Category className="w-4 h-4 text-primary" />
                  </button>
                  <button className="coach-option-btn" onClick={() => handleMainOption('أريد طرق تعلم مختلفة', 'methods')}>
                    <span>أريد طرق تعلم مختلفة</span>
                    <Extension className="w-4 h-4 text-primary" />
                  </button>
                </div>
              )}

              {/* Strategies Options */}
              {msg.options === 'strategies' && (
                <div className="coach-options-grid coach-strategies-grid">
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('عصف ذهني', 'brainstorming')}>
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span>عصف ذهني</span>
                  </button>
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('اكتشف الخطأ', 'error')}>
                    <Search className="w-5 h-5 text-primary" />
                    <span>اكتشف الخطأ</span>
                  </button>
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('مثال أبسط', 'simpler')}>
                    <SmartToy className="w-5 h-5 text-primary" />
                    <span>مثال أبسط</span>
                  </button>
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('سؤال مفاهيمي', 'conceptual')}>
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>سؤال مفاهيمي</span>
                  </button>
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('أحجية', 'puzzle')}>
                    <Extension className="w-5 h-5 text-primary" />
                    <span>أحجية</span>
                  </button>
                  <button className="coach-option-btn coach-strategy-btn" onClick={() => handleStrategySelect('الحل النموذجي', 'solution')}>
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>الحل النموذجي</span>
                  </button>

                  <button className="coach-option-btn coach-back-btn" onClick={initChat}>
                    <ArrowRight className="w-4 h-4" />
                    <span>رجوع للقائمة الرئيسية</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="coach-message coach-msg-bot">
              <div className="coach-bubble coach-bubble-bot">
                <div className="coach-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="coach-panel-footer">
          <div className="relative flex items-center">
            <input
              type="text"
              disabled
              placeholder="اختر من الخيارات أعلاه..."
              className="w-full bg-surface-container-low/60 border border-outline-variant/30 rounded-full py-2.5 px-5 text-sm text-on-surface-variant cursor-not-allowed focus:outline-none"
              dir="rtl"
            />
            <button className="absolute left-2 w-7 h-7 rounded-full bg-surface-container-high/50 flex items-center justify-center text-on-surface-variant/40 cursor-not-allowed">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
