import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserRole } from "../types";
import SidneyAvatar from "./SidneyAvatar";
import {
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  FileText
} from "lucide-react";

interface ChatAIProps {
  currentRole: UserRole;
}

export default function ChatAI({ currentRole }: ChatAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `### 🔵 Bem-vindo ao SEIE (Sistema Especialista em Inteligência Eleitoral)

Olá! Eu sou o assistente de Inteligência Artificial da **CTAS Consultoria**, programado para produzir relatórios analíticos fundamentados estritamente na base de dados eleitorais e nas normativas de Sergipe.

Estou pronto para responder às suas dúvidas e analisar as pesquisas com neutralidade estatística e rigor técnico. Como posso ajudar você hoje?`,
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const presetQuestions = [
    {
      label: "📊 Diagnóstico Geral",
      prompt: "Faça uma análise diagnóstica geral comparando todas as pesquisas registradas e trackings no banco de dados de Sergipe."
    },
    {
      label: "📍 Foco no Agreste Central",
      prompt: "Quem lidera no território do Agreste Central, qual o perfil desse eleitorado e o impacto histórico de Itabaiana?"
    },
    {
      label: "🔍 Cenários de Incerteza",
      prompt: "Quais cenários apresentam empates técnicos considerando as margens de erro declaradas de cada instituto no banco de dados?"
    },
    {
      label: "🛑 Teste de Alucinação (Simão Dias)",
      prompt: "Qual é o percentual de intenção de voto do candidato Rogério Carvalho especificamente no município de Simão Dias na última pesquisa?"
    }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
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
        throw new Error(data.message || "Erro desconhecido na resposta da inteligência.");
      }
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `### 🔴 [Crítico] Erro de Processamento Técnico\n\nNão foi possível conectar com o motor de IA no servidor.\n\n**Detalhe Técnico:** ${error.message || "O servidor não pôde concluir o processamento no momento. Verifique sua conexão ou se a chave GEMINI_API_KEY no painel de segredos está ativa."}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Deseja redefinir a conversação com a inteligência eleitoral?")) {
      setMessages([
        {
          id: "welcome-re",
          sender: "ai",
          text: `### 🔵 Conversação Reiniciada\n\nMotor de RAG estatístico limpo. Faça uma nova pergunta técnica sobre o cenário de Sergipe.`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Custom visual parser for SEIE report output formatting
  const renderParsedMessage = (text: string) => {
    // Split on headers to build beautifully styled visual containers
    const sections = text.split("### ");

    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;

          // Check if this chunk is a header section
          const lines = section.split("\n");
          const firstLine = lines[0];
          const remainingText = lines.slice(1).join("\n");

          const isHeader = text.includes(`### ${firstLine}`);

          if (isHeader) {
            // Clean section icon/text
            const title = firstLine.replace("🔵 ", "").trim();
            const body = parseAlertsAndBadges(remainingText);

            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-900"></div>
                  <h3 className="text-xs font-serif font-black uppercase text-blue-950 tracking-wider">
                    {title}
                  </h3>
                </div>
                <div className="p-4 text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-wrap">
                  {body}
                </div>
              </div>
            );
          }

          // Plain text rendering for welcome message or fallback
          return (
            <div key={idx} className="text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-wrap">
              {parseAlertsAndBadges(section)}
            </div>
          );
        })}
      </div>
    );
  };

  // Sub-parser to swap plain alert strings (e.g., "🔴 [Crítico]") into beautiful colored visual warning badges
  const parseAlertsAndBadges = (rawText: string) => {
    const alertPatterns = [
      {
        key: "🔴 [Crítico]",
        bg: "bg-red-50 text-red-800 border-red-200",
        label: "Crítico",
        color: "bg-red-500"
      },
      {
        key: "⚠ [Dentro da Margem de Erro]",
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Dentro da Margem de Erro (Empate Técnico)",
        color: "bg-amber-500"
      },
      {
        key: "📈 [Tendência de Alta]",
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        label: "Tendência de Alta",
        color: "bg-emerald-500"
      },
      {
        key: "📉 [Tendência de Queda]",
        bg: "bg-rose-50 text-rose-800 border-rose-200",
        label: "Tendência de Queda",
        color: "bg-rose-500"
      },
      {
        key: "🔵 [Estabilidade]",
        bg: "bg-blue-50 text-blue-800 border-blue-200",
        label: "Estabilidade",
        color: "bg-blue-950"
      },
      {
        key: "📢 [Propaganda Antecipada]",
        bg: "bg-violet-50 text-violet-800 border-violet-200",
        label: "Alerta de Propaganda Antecipada (Art. 36)",
        color: "bg-violet-500"
      },
      {
        key: "🟠 [Dados Insuficientes]",
        bg: "bg-orange-50 text-orange-800 border-orange-200",
        label: "Dados Insuficientes",
        color: "bg-orange-500"
      },
      {
        key: "purple-badge", // Custom difference key
        match: "purple-badge",
        bg: "bg-purple-50 text-purple-800 border-purple-200"
      }
    ];

    // Splitting text by line to inject badges cleanly
    const lines = rawText.split("\n");

    return lines.map((line, lIdx) => {
      // Look for any alert markers on this line
      const matchedPattern = alertPatterns.find((p) => line.includes(p.key));

      if (matchedPattern) {
        // Clean line text
        const cleanLine = line.replace(matchedPattern.key, "").trim();

        return (
          <div
            key={lIdx}
            className={`my-3 p-3.5 rounded-xl border flex items-start gap-2.5 ${matchedPattern.bg}`}
          >
            <span className="flex h-2 w-2 relative mt-1.5 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${matchedPattern.color} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${matchedPattern.color}`}></span>
            </span>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {matchedPattern.label}
              </p>
              <p className="text-xs mt-0.5 font-medium">{cleanLine}</p>
            </div>
          </div>
        );
      }

      // Check for specific Grau de Confiança colored classification
      if (line.includes("Grau de Confiança:")) {
        const hasHigh = line.includes("Muito Alto") || line.includes("Alto");
        const hasModerate = line.includes("Moderado");
        const badgeColor = hasHigh
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : hasModerate
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-rose-50 text-rose-800 border-rose-200";

        return (
          <div key={lIdx} className={`my-2 p-3 rounded-lg border font-mono text-[10px] ${badgeColor}`}>
            <strong>{line}</strong>
          </div>
        );
      }

      // Default line rendering
      return (
        <span key={lIdx} className="block min-h-[1px]">
          {line}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-130px)] flex flex-col justify-between animate-fade-in">
      
      {/* Title / Chat Header */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950 text-white rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-serif font-bold text-slate-800 flex items-center gap-2">
              SEIE especialista Inteligente
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              RAG integrado • Sergipe Eleitoral
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          title="Limpar Histórico"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages and presets column */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        
        {/* Preset helper prompts */}
        {messages.length === 1 && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Perguntas técnicas sugeridas para teste do sistema:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetQuestions.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="bg-white p-4 text-left border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all text-xs flex flex-col justify-between h-24"
                >
                  <span className="font-serif font-bold text-slate-800">{q.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono line-clamp-2 mt-1.5">{q.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Profile icon */}
                {isAI ? (
                  <SidneyAvatar size={32} className="w-8 h-8" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-sans font-bold bg-slate-200 text-slate-700"
                  >
                    U
                  </div>
                )}

                {/* Bubble card */}
                <div
                  className={`p-5 rounded-2xl border ${
                    isAI
                      ? "bg-slate-50 border-slate-200/80 text-slate-800"
                      : "bg-blue-950 border-blue-950 text-white"
                  }`}
                >
                  {isAI ? (
                    renderParsedMessage(msg.text)
                  ) : (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                  <span className="text-[9px] font-mono text-slate-400 block mt-2.5">
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading status */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-xs items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex space-x-1.5">
                <span className="h-2 w-2 bg-blue-950 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-blue-950 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-blue-950 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Consultando base de Sergipe...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(userInput);
        }}
        className="mt-4 bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm focus-within:border-blue-950 transition-colors"
      >
        <input
          type="text"
          placeholder="Escreva sua pergunta ou cenário eleitoral..."
          value={userInput}
          disabled={isLoading}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 text-xs outline-none px-2.5 py-1 text-slate-800 bg-transparent"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all ${
            userInput.trim() && !isLoading
              ? "bg-blue-950 text-white shadow-sm hover:bg-blue-900"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
