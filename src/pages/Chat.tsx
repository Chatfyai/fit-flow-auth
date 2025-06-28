import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, User, Send, ArrowLeft } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá ${user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta'}! 👋 Sou sua IA personal trainer. Como posso te ajudar hoje?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular resposta da IA após 1-2 segundos
    setTimeout(() => {
      const botResponses = [
        "Ótima pergunta! Vou te ajudar com isso. 💪",
        "Baseado no seu perfil, recomendo focar em exercícios compostos.",
        "Que tal criarmos um plano personalizado para você?",
        "Lembre-se: consistência é a chave para o sucesso! 🎯",
        "Posso te sugerir alguns exercícios específicos para seu objetivo.",
        "Vamos trabalhar juntos para alcançar seus objetivos fitness!"
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 pb-20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-3 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-3 shadow-md">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">IA Personal Trainer</h1>
                <p className="text-xs text-gray-500">Online agora</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-140px)] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isBot 
                      ? 'bg-gradient-to-r from-primary to-accent mr-2' 
                      : 'bg-gray-600 ml-2'
                  }`}>
                    {message.isBot ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <Card className={`p-3 ${
                    message.isBot 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gradient-to-r from-primary to-accent text-white border-primary'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.isBot ? 'text-gray-500' : 'text-white/70'
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </Card>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mr-2">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <Card className="p-3 bg-white border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="gradient-bg text-white w-11 h-11 rounded-full p-0 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Chat; 