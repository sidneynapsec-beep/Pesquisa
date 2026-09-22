import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserRole } from "../types";
import SidneyAvatar from "./SidneyAvatar";
import {
  Sparkles,
  Send,
  HelpCircle,
  RotateCcw,
  X,
  MessageSquare,
  Bot,
  User,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";

interface SidneyAgentProps {
  currentRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function SidneyAgent({ currentRole, isOpen, onClose }: SidneyAgentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sidney-welcome",
      sender: "ai",
      text: `### 🔵 Olá, eu sou o Sidney!
      
Sou o seu assistente de Inteligência Eleitoral da **CTAS Consultoria**. 

Estou aqui para realizar consultas instantâneas sobre dados demográficos, estatísticas de fatias amostrais, cruzamentos de pesquisas e análises de tendência eleitoral em Sergipe.

Como posso ajudar no seu planejamento estratégico hoje?`,
      timestamp: new Date()
    }
  ]);

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const presets = [
    {
      label: "📈 Tendências",
      prompt: "Sidney, faça um resumo das tendências e quem lidera na média ponderada."
    },
    {
      label: "📍 Foco Regional",
      prompt: "Sidney, qual o perfil do eleitorado da Grande Aracaju e do Agreste Central?"
    },
    {
      label: "🗳️ Margem de Erro",
      prompt: "Sidney, explique quais candidatos estão empatados tecnicamente nas últimas bases."
    }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          role: currentRole,
          currentContext: {
            agentRequested: "Sidney",
            appLocalTime: "2026-07-04"
          }
        })
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "simulated") {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.text,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.message || "Falha na resposta do Sidney.");
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `### 🔴 Erro de Conexão\n\nNão consegui processar sua consulta no momento.\n\n**Detalhe:** ${error.message || "Erro de rede com o servidor."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    if (confirm("Deseja reiniciar a conversa com o Sidney?")) {
      setMessages([
        {
          id: `re-${Date.now()}`,
          sender: "ai",
          text: `### 🔵 Conversa Reiniciada\n\nOlá! Sou o Sidney. Estou pronto para novas consultas sobre o cenário eleitoral de Sergipe.`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const renderParsedText = (text: string) => {
    const sections = text.split("### ");
    return (
      <div className="space-y-3">
        {sections.map((section, sIdx) => {
          if (!section.trim()) return null;

          const lines = section.split("\n");
          const firstLine = lines[0];
          const rest = lines.slice(1).join("\n");

          const isHeader = text.includes(`### ${firstLine}`);

          if (isHeader) {
            const title = firstLine.replace("🔵 ", "").trim();
            return (
              <div key={sIdx} className="bg-white border border-gray-100 rounded-lg p-3 my-1 shadow-xs">
                <p className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider mb-1">
                  {title}
                </p>
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{rest.trim()}</p>
              </div>
            );
          }

          return (
            <p key={sIdx} className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {section.trim()}
            </p>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between animate-slide-in text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <SidneyAvatar size={40} className="w-10 h-10" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold font-serif">Agente Sidney</h2>
              <span className="text-[9px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded-md font-mono border border-blue-700">
                Especialista
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Suporte e inteligência consultiva</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetChat}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Reiniciar chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Fechar consultor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5" />
            Consultas Sugeridas:
          </div>
          <div className="flex flex-col gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.prompt)}
                className="text-left bg-slate-900 hover:bg-slate-850 p-2 rounded-lg text-[11px] text-slate-300 border border-slate-800 hover:border-slate-750 transition-all flex items-center justify-between"
              >
                <span>{p.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {messages.map((m) => {
          const isAI = m.sender === "ai";
          return (
            <div key={m.id} className={`flex gap-2.5 max-w-[90%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
              {isAI ? (
                <SidneyAvatar size={28} className="w-7 h-7" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-700 text-slate-200"
                >
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isAI ? "bg-slate-800 text-slate-100" : "bg-blue-600 text-white"}`}>
                {isAI ? renderParsedText(m.text) : <p className="whitespace-pre-wrap">{m.text}</p>}
                <span className="text-[9px] text-slate-400 font-mono block mt-1.5 text-right">
                  {m.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2 mr-auto max-w-xs items-center p-3 bg-slate-850 border border-slate-850 rounded-2xl">
            <div className="flex space-x-1">
              <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Sidney analisando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(userInput);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Pergunte ao Sidney..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-600 transition-colors"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all ${
            userInput.trim() && !isLoading ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
