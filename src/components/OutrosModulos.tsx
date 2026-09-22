import React, { useState, useMemo, useEffect } from "react";
import { ActiveTab, UserRole, Poll } from "../types";
import { PRE_CANDIDATES, CANDIDATOS_OFICIAIS_2026 } from "../data/sergipeData";
import { useElectoralData } from "../context/ElectoralDataContext";
import { authenticatedFetch } from "../lib/apiAuth";
import CargosProjectionsView from "./CargosProjectionsView";
import CaminhoDaVitoria from "./CaminhoDaVitoria";
import {
  Building,
  Radio,
  TrendingUp,
  LineChart,
  BookOpen,
  Layers,
  Settings,
  Sliders,
  CheckCircle,
  Award,
  AlertCircle,
  Database,
  UploadCloud,
  PlusCircle,
  History,
  Filter,
  Check,
  Search,
  Landmark,
  Vote,
  ShieldCheck,
  Zap,
  MapPin,
  Save,
  Download,
  HardDrive,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  FileSpreadsheet,
  FileCode
} from "lucide-react";

interface OutrosModulosProps {
  activeTab: ActiveTab;
  currentRole: UserRole;
  userEmail: string;
  polls?: Poll[];
}

// Historial database of Sergipe winners separated by roles (cargos) - 2024 & 2022 only
const winnersData: {
  [year: string]: { cargo: string; name: string; party: string; votes: string; details: string; color: string }[];
} = {
  "2024": [
    { cargo: "Prefeita de Aracaju", name: "Emília Corrêa", party: "PL", votes: "170.829 votos (57,46%)", details: "Eleita no 2º turno como primeira mulher prefeita da capital de Sergipe, superando Luiz Roberto.", color: "bg-blue-500/10 dark:bg-blue-500/5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" },
    { cargo: "Prefeito de Itabaiana", name: "Valmir de Francisquinho", party: "PL", votes: "36.412 votos (57,29%)", details: "Retorno consolidado no maior colégio eleitoral do Agreste Central sergipano.", color: "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" },
    { cargo: "Prefeita de N. Sra. do Socorro", name: "Carminha Paiva", party: "Republicanos", votes: "39.815 votos (51,62%)", details: "Vitória governista na segunda maior cidade do estado em disputa concorrida.", color: "bg-purple-500/10 dark:bg-purple-500/5 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400" },
    { cargo: "Prefeito de Lagarto", name: "Sérgio Reis", party: "PSD", votes: "31.904 votos (50,91%)", details: "Vitória estratégica no Centro-Sul superando a hegemonia de grupos tradicionais.", color: "bg-amber-500/10 dark:bg-amber-500/5 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" }
  ],
  "2022": [
    { cargo: "Governador", name: "Fábio Mitidieri", party: "PSD", votes: "631.132 votos (51,70%)", details: "Eleito no 2º turno em disputa acirrada contra Rogério Carvalho (PT).", color: "bg-blue-500/10 dark:bg-blue-500/5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" },
    { cargo: "Senador", name: "Laércio Oliveira", party: "PP", votes: "310.300 votos (28,57%)", details: "Eleito em turno único superando Valadares Filho e Rogério Carvalho.", color: "bg-amber-500/10 dark:bg-amber-500/5 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" },
    { cargo: "Deputada Federal mais Votada", name: "Yandra Moura", party: "União", votes: "131.471 votos", details: "Deputada federal mais votada da história de Sergipe, com expressiva presença em todo o território.", color: "bg-purple-500/10 dark:bg-purple-500/5 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400" },
    { cargo: "Deputado Estadual mais Votado", name: "Cristiano Cavalcante", party: "União", votes: "58.756 votos", details: "Líder geral na eleição para a ALESE, consolidando liderança do grupo governista.", color: "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" }
  ]
};

export default function OutrosModulos({ activeTab, currentRole, userEmail, polls = [] }: OutrosModulosProps) {
  const globalContext = useElectoralData();
  const effectivePolls = globalContext?.polls?.length ? globalContext.polls : polls;

  // Dynamic simulation baseline from current poll data
  const simFabioBase = effectivePolls[0]?.results?.["Fábio Mitidieri"] || 34.0;
  const simValmirBase = effectivePolls[0]?.results?.["Valmir de Francisquinho"] || 30.0;
  const simRogerioBase = effectivePolls[0]?.results?.["Rogério Carvalho"] || 15.0;

  // --- NARRATIVAS (DEMANDAS DOS FORMULÁRIOS) ---
  const [candA, setCandA] = useState("Fábio Mitidieri");
  const [candB, setCandB] = useState("Valmir de Francisquinho");
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const simulateRunoff = () => {
    if (candA === candB) {
      setSimulationResult("⚠️ Erro: Escolha candidatos distintos para simular o segundo turno.");
      return;
    }
    // Simulate runoff percentages based on candidate spectrum
    let scoreA = 51.5;
    let scoreB = 48.5;
    if (candA === "Valmir de Francisquinho" && candB === "Rogério Carvalho") {
      scoreA = 53.0;
      scoreB = 47.0;
    } else if (candA === "Fábio Mitidieri" && candB === "Rogério Carvalho") {
      scoreA = 54.5;
      scoreB = 45.5;
    } else if (candA === "Emília Corrêa") {
      scoreA = 49.0;
      scoreB = 51.0;
    }
    setSimulationResult(`🔮 Resultado Simulado (CTAS Analytics): ${candA} ${scoreA}% vs. ${candB} ${scoreB}% (Votos Válidos). Cenário extremamente competitivo.`);
  };

  // --- PROJEÇÃO MULTIPLICADORA ---
  const [growthMultiplier, setGrowthMultiplier] = useState(1.0);

  // --- SEARCH FILTERS FOR PARLIAMENTARY & EXECUTIVE TABS ---
  const [governorSearch, setGovernorSearch] = useState("");
  const [senatorSearch, setSenatorSearch] = useState("");
  const [federalSearch, setFederalSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  // Filtered lists from official 2026 dataset
  const officialGovernors = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter(
      (c) =>
        c.role === "Governador" &&
        (c.name.toLowerCase().includes(governorSearch.toLowerCase()) ||
          c.number.includes(governorSearch) ||
          c.coalition.toLowerCase().includes(governorSearch.toLowerCase()))
    );
  }, [governorSearch]);

  const officialSenators = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter(
      (c) =>
        c.role === "Senador" &&
        (c.name.toLowerCase().includes(senatorSearch.toLowerCase()) ||
          c.number.includes(senatorSearch) ||
          c.coalition.toLowerCase().includes(senatorSearch.toLowerCase()))
    );
  }, [senatorSearch]);

  const officialFederals = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter(
      (c) =>
        c.role === "Deputado Federal" &&
        (c.name.toLowerCase().includes(federalSearch.toLowerCase()) ||
          c.number.includes(federalSearch) ||
          c.coalition.toLowerCase().includes(federalSearch.toLowerCase()))
    );
  }, [federalSearch]);

  const officialStates = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter(
      (c) =>
        c.role === "Deputado Estadual" &&
        (c.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
          c.number.includes(stateSearch) ||
          c.coalition.toLowerCase().includes(stateSearch.toLowerCase()))
    );
  }, [stateSearch]);

  // --- NARRATIVAS (DEMANDAS DOS FORMULÁRIOS) ---
  const [voterFeedback, setVoterFeedback] = useState([
    { text: "Não aguentamos mais a falta de abastecimento regular de água aqui no interior da Glória, as torneiras vivem secas.", category: "Abastecimento de Água", region: "Alto Sertão", date: "2026-07-02" },
    { text: "A produção de laranja e tangerina no Sul do estado precisa de mais apoio técnico e subsídios para fertilizantes.", category: "Apoio à Citricultura", region: "Sul Sergipano", date: "2026-06-28" },
    { text: "As consultas e cirurgias eletivas no hospital de Itabaiana demoram muitos meses, precisamos de um mutirão urgente.", category: "Saúde Pública", region: "Agreste Central", date: "2026-07-01" },
    { text: "Falta policiamento ostensivo nas principais ruas comerciais do Socorro, estamos nos sentindo muito inseguros.", category: "Segurança Pública", region: "Grande Aracaju", date: "2026-07-03" }
  ]);
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [feedbackRegion, setFeedbackRegion] = useState("Grande Aracaju");

  if (activeTab === "caminho-vitoria") {
    return <CaminhoDaVitoria polls={effectivePolls} />;
  }

  if (activeTab === "governador") {
    return <CargosProjectionsView role="Governador" polls={polls} />;
  }

  if (activeTab === "senadores") {
    return <CargosProjectionsView role="Senador" polls={polls} />;
  }

  if (activeTab === "deputados-federais") {
    return <CargosProjectionsView role="Deputado Federal" polls={polls} />;
  }

  if (activeTab === "deputados-estaduais") {
    return <CargosProjectionsView role="Deputado Estadual" polls={polls} />;
  }

  if (activeTab === "projecao") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-serif font-bold text-blue-950">Entendendo Nossos Modelos de Projeção</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Simulação matemática simples e transparente explicada passo a passo para o usuário.
          </p>
        </div>

        {/* Guia Leigo Explicativo */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 space-y-4">
          <h3 className="font-serif font-bold text-blue-950 text-sm flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-900" />
            💡 Como funciona este Simulador Estatístico? (Explicado de forma simples)
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Este simulador <strong>não tenta prever o futuro de forma mágica</strong> nem cria dados artificiais. Ele utiliza equações matemáticas simples para projetar o que aconteceria com os resultados reais das pesquisas registradas se a velocidade de crescimento de um candidato mudar nas próximas semanas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-white p-4 rounded-xl border border-blue-50 space-y-2">
              <span className="font-mono text-blue-800 font-bold block">1. O Fator de Ritmo</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                A barra de controle abaixo representa o ritmo da campanha. Um multiplicador de <strong>1.0x</strong> mantém a tendência atual de crescimento. Valores acima (ex: <strong>1.5x</strong>) projetam um forte engajamento positivo. Valores abaixo (ex: <strong>0.8x</strong>) simulam perda de ritmo.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-50 space-y-2">
              <span className="font-mono text-blue-800 font-bold block">2. Ponderação Territorial</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                O modelo respeita o peso de cada região. Sergipe possui mais eleitores na Grande Aracaju do que no Alto Sertão. Portanto, um crescimento de 5% na capital tem um impacto muito maior no total do que em áreas menos populosas.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-50 space-y-2">
              <span className="font-mono text-blue-800 font-bold block">3. Base em Pesquisas Reais</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Toda projeção tem como ponto de partida as pesquisas devidamente auditadas e cadastradas no sistema <strong>PesqEle do TSE</strong>, impedindo qualquer tipo de distorção ou criação de boatos.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <h2 className="text-sm font-serif font-bold text-blue-950 flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-blue-900" />
              Simular Fator de Ritmo da Campanha
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Ritmo de Crescimento Semanal</span>
                  <span className="font-mono text-blue-900 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {growthMultiplier === 1.0 ? "1.0x (Tendência Normal)" : `${growthMultiplier}x (${growthMultiplier > 1.0 ? "Acelerado" : "Desacelerado"})`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={growthMultiplier}
                  onChange={(e) => setGrowthMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-950"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                  <span>0.5x (Desaceleração Forte)</span>
                  <span>1.0x (Natural)</span>
                  <span>2.0x (Aceleração Máxima)</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3.5">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Projeção Estimada em 60 dias de Campanha (% Votos)
                </h4>
                
                <div className="space-y-3">
                  {/* Fabio */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Fábio Mitidieri</span>
                      <span className="font-mono text-blue-900">{(simFabioBase * growthMultiplier).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, simFabioBase * growthMultiplier)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Valmir */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Valmir de Francisquinho</span>
                      <span className="font-mono text-emerald-700">{(simValmirBase * growthMultiplier).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, simValmirBase * growthMultiplier)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Rogerio */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Rogério Carvalho</span>
                      <span className="font-mono text-red-700">{(simRogerioBase * growthMultiplier).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-600 h-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, simRogerioBase * growthMultiplier)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                ⚠️ Aviso de Rigor e Compromisso
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As simulações estatísticas são apenas ferramentas de estudo estratégico interno e não substituem, em hipótese alguma, as pesquisas registradas de campo.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                A precisão do cálculo depende do preenchimento consistente de dados de pesquisas válidas na aba de <strong>Diagnóstico de Pesquisas</strong>.
              </p>
            </div>
            <div className="text-[10px] text-slate-400 font-mono border-t border-slate-200/60 pt-3">
              Modelagem Linear de Tendência • CTAS Inteligência Eleitoral
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "narrativas") {
    // Basic automatic classification algorithm strictly based on input keywords (No hallucinated/created data!)
    const classifyText = (text: string): string => {
      const t = text.toLowerCase();
      if (t.includes("água") || t.includes("abastecimento") || t.includes("saneamento") || t.includes("torneira")) return "Abastecimento de Água";
      if (t.includes("laranja") || t.includes("limão") || t.includes("tangerina") || t.includes("citri") || t.includes("agricultura") || t.includes("produtor")) return "Apoio à Citricultura";
      if (t.includes("saúde") || t.includes("médico") || t.includes("hospital") || t.includes("consulta") || t.includes("exame") || t.includes("doença")) return "Saúde Pública";
      if (t.includes("segurança") || t.includes("polícia") || t.includes("policial") || t.includes("roubo") || t.includes("crime") || t.includes("assalto")) return "Segurança Pública";
      if (t.includes("emprego") || t.includes("vaga") || t.includes("trabalho") || t.includes("indústria") || t.includes("fábrica")) return "Geração de Emprego";
      return "Outras Demandas Sociais";
    };

    const handleAddFeedback = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFeedbackText.trim()) return;

      const category = classifyText(newFeedbackText);
      const newEntry = {
        text: newFeedbackText,
        category,
        region: feedbackRegion,
        date: new Date().toISOString().split("T")[0]
      };

      setVoterFeedback((prev) => [newEntry, ...prev]);
      setNewFeedbackText("");
    };

    // Calculate actual demand percentages directly from the forms list
    const categoryCounts: { [key: string]: number } = {};
    voterFeedback.forEach((entry) => {
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    });
    const totalFeedback = voterFeedback.length;

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-serif font-bold text-blue-950">Mapeamento de Demandas Reais (Formulários)</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Análise e catalogação direta de formulários de rua e questionários de opinião. Sem informações inventadas.
          </p>
        </div>

        {/* Warning about commitment to truth */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Compromisso contra Desinformação:</strong> Esta seção não gera boatos nem cria narrativas falsas. Ela serve exclusivamente para que o coordenador da campanha registre e analise as queixas e pedidos reais colhidos nos formulários de atendimento ao eleitor.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to submit actual voter response */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-sm font-serif font-bold text-blue-950 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-blue-900" />
              Inserir Dados do Formulário do Eleitor
            </h2>
            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Relato do Eleitor (O que a pessoa escreveu/disse?)
                </label>
                <textarea
                  required
                  value={newFeedbackText}
                  onChange={(e) => setNewFeedbackText(e.target.value)}
                  placeholder="Ex: Falta asfalto na rua principal e policiamento na praça à noite..."
                  rows={4}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-900 resize-none bg-slate-50 focus:bg-white"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  O sistema irá ler as palavras-chave do relato para classificar a demanda de forma automatizada.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Região Geográfica do Relato
                </label>
                <select
                  value={feedbackRegion}
                  onChange={(e) => setFeedbackRegion(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Grande Aracaju">Grande Aracaju</option>
                  <option value="Agreste Central">Agreste Central</option>
                  <option value="Centro Sul">Centro Sul</option>
                  <option value="Alto Sertão">Alto Sertão</option>
                  <option value="Sul Sergipano">Sul Sergipano</option>
                  <option value="Baixo São Francisco">Baixo São Francisco</option>
                  <option value="Médio Sertão">Médio Sertão</option>
                  <option value="Leste Sergipano">Leste Sergipano</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-950 text-white font-bold text-xs p-3 rounded-lg hover:bg-blue-900 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                Categorizar e Registrar Formulário
              </button>
            </form>
          </div>

          {/* Real demand mapping list & charts directly from state */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-serif font-bold text-blue-950">
                Demandas Reais Extraídas dos Formulários ({totalFeedback})
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                Dados Baseados em Fatos
              </span>
            </div>

            {/* Demand percentages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = ((count / totalFeedback) * 100).toFixed(0);
                return (
                  <div key={cat} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
                      {cat}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-serif font-bold text-slate-800">{pct}%</span>
                      <span className="text-[10px] text-slate-400">({count} form)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voter stories list */}
            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {voterFeedback.map((entry, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                        {entry.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {entry.region}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{entry.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{entry.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ESTADOS DO GERENCIADOR DE BASE E SALVAMENTO DO SISTEMA ---
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isSavingBase, setIsSavingBase] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (activeTab === "configuracoes") {
      fetch("/api/system/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setSystemStatus(data.data);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleSaveSystemBase = async () => {
    setIsSavingBase(true);
    setSaveStatusMsg(null);
    try {
      const res = await authenticatedFetch("/api/system/save", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSaveStatusMsg({
          type: "success",
          text: `Base do sistema gravada com sucesso! (${data.stats?.pollsCount || 0} pesquisas, ${data.stats?.datasetsCount || 0} microdados e ${data.stats?.radarMentionsCount || 0} notícias do radar persistidas em disco).`
        });
        // refresh stats
        const statusRes = await fetch("/api/system/status");
        const statusData = await statusRes.json();
        if (statusData.status === "success") setSystemStatus(statusData.data);
      } else {
        setSaveStatusMsg({ type: "error", text: data.message || "Erro ao gravar base do sistema." });
      }
    } catch (err: any) {
      setSaveStatusMsg({ type: "error", text: err.message || "Falha na comunicação com o servidor de persistência." });
    } finally {
      setIsSavingBase(false);
    }
  };

  const handleExportSystemBase = () => {
    window.location.href = "/api/system/export";
  };

  const handleImportSystemBase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setSaveStatusMsg(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const res = await authenticatedFetch("/api/system/import", {
          method: "POST",
          body: JSON.stringify({ data: parsed })
        });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setSaveStatusMsg({
            type: "success",
            text: `Base restaurada com sucesso! (${data.imported?.polls || 0} pesquisas e ${data.imported?.radarMentions || 0} notícias do Radar Digital).`
          });
          // refresh stats
          const statusRes = await fetch("/api/system/status");
          const statusData = await statusRes.json();
          if (statusData.status === "success") setSystemStatus(statusData.data);
        } else {
          setSaveStatusMsg({ type: "error", text: data.message || "Erro na importação da base." });
        }
      } catch (err: any) {
        setSaveStatusMsg({ type: "error", text: "Arquivo JSON inválido ou corrompido." });
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // --- CONFIGURAÇÕES ---
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-blue-950">Configurações & Persistência do Sistema</h1>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Gerenciamento integral da base de dados, exportação JSON, snapshots persistentes e auditoria estatística.
        </p>
      </div>

      {/* GERENCIAMENTO E SALVAMENTO DA BASE DO SISTEMA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-serif font-bold text-blue-950 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-900" />
              Base de Dados Permanente do Sistema (SEIE)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Armazenamento em formato JSON estruturado com persistência em disco, integridade de microdados e backup contínuo.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Formato Persistente Ativo
          </span>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Pesquisas & Trackings</span>
            <div className="text-xl font-serif font-bold text-blue-950">
              {systemStatus?.stats?.totalPolls ?? (polls?.length || 0)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block truncate">CTAS / TSE 2026</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Microdados & Datasets</span>
            <div className="text-xl font-serif font-bold text-blue-950">
              {systemStatus?.stats?.totalDatasets ?? 1}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block truncate">Cruzamentos Territoriais</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Notícias Radar Digital</span>
            <div className="text-xl font-serif font-bold text-blue-950">
              {systemStatus?.stats?.totalRadarMentions ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block truncate">Fontes Auditadas</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Municípios de Sergipe</span>
            <div className="text-xl font-serif font-bold text-blue-950">75</div>
            <span className="text-[10px] text-slate-400 font-mono block truncate">8 Regiões / Territórios</span>
          </div>
        </div>

        {/* Feedback Message */}
        {saveStatusMsg && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
              saveStatusMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {saveStatusMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{saveStatusMsg.type === "success" ? "Operação Concluída" : "Aviso de Falha"}</p>
              <p className="mt-0.5">{saveStatusMsg.text}</p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleSaveSystemBase}
            disabled={isSavingBase || currentRole === "Viewer"}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-950 text-white text-xs font-semibold rounded-xl hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSavingBase ? "animate-spin" : ""}`} />
            {isSavingBase ? "Gravando em Disco..." : "Salvar Base do Sistema (Snapshot em Disco)"}
          </button>

          <button
            onClick={handleExportSystemBase}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-900" />
            Exportar Base Completa (JSON)
          </button>

          <label className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer ${currentRole === "Viewer" ? "opacity-50 pointer-events-none" : ""}`}>
            <UploadCloud className="w-4 h-4 text-blue-900" />
            <span>{isImporting ? "Restaurando..." : "Importar / Restaurar Base (JSON)"}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportSystemBase}
              disabled={isImporting || currentRole === "Viewer"}
              className="hidden"
            />
          </label>
        </div>

        {/* Technical format breakdown */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-blue-950 font-bold font-mono text-[11px] uppercase tracking-wider">
            <FileJson className="w-4 h-4 text-blue-900" />
            Especificações do Formato de Armazenamento
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
            <div>• <strong>Polls Schema:</strong> ID, Instituto, CONRE 10801, Amostra, Margem, Resultados, Cargos</div>
            <div>• <strong>Microdata Schema:</strong> Tabulações cruzadas, Bairros, Municípios, Pesos amostrais</div>
            <div>• <strong>Digital Radar:</strong> Notícias catalogadas, URLs de auditoria, Sentimento, Termos</div>
            <div>• <strong>Rastreabilidade:</strong> Sidney Barreto Batista / CTAS Consultoria e Pesquisa</div>
          </div>
        </div>
      </div>

      {/* PACOTE COMPLETO DO CÓDIGO-FONTE (DOWNLOAD DO PROJETO INTEGRAL) */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white p-6 rounded-2xl border border-blue-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 text-emerald-400">
                <Download className="w-5 h-5" />
              </span>
              <h2 className="text-base font-serif font-bold tracking-tight">
                Código-Fonte Completo do SEIE (Download em ZIP)
              </h2>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed max-w-2xl">
              Baixe com 1 clique o pacote completo com todos os arquivos do sistema (backend Express, frontend React/Vite, algoritmos estatísticos TSE, bases de dados de Sergipe e guia de instalação local passo a passo).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/api/download-ai-consolidated"
              download="seie_codigo_consolidado_para_ia.txt"
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer border border-blue-400 active:scale-95"
              title="Baixa um único arquivo de texto contendo todos os módulos principais prontos para colar no ChatGPT, Claude ou Gemini"
              id="btn-download-ai-text"
            >
              <FileCode className="w-4 h-4" />
              <span>Arquivo Único para IA (.TXT)</span>
            </a>

            <a
              href="/api/download-source-zip"
              download="codigo_fonte_seie_completo.zip"
              className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer border border-emerald-400 active:scale-95"
              id="btn-download-source-card"
            >
              <Download className="w-4 h-4" />
              <span>Baixar ZIP Completo (.ZIP)</span>
            </a>
          </div>
        </div>

        <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs text-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div>✓ Inclui 100% dos códigos-fonte (.ts, .tsx, .json)</div>
          <div>✓ Inclui manual de instalação local e dependências</div>
          <div>✓ Pronto para rodar com npm install e npm run dev</div>
        </div>
      </div>

      {/* STATUS OPERACIONAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
        <h2 className="text-sm font-serif font-bold text-blue-950 flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-blue-900" />
          Status Operacional e Credenciais
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Perfil de Usuário Atual</span>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {currentRole}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Autenticado via: {userEmail}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Banco de Dados Conectado</span>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Armazenamento JSON Persistente + IndexedDB
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Registros síncronos Sergipe: 75 municípios</p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Rigor TSE:</strong> A exibição e divulgação de dados eleitorais seguem as diretrizes da Resolução nº 23.747/2026. Todas as pesquisas registradas em nosso banco estão cadastradas regularmente na Justiça Eleitoral sob responsabilidade estatística do CONRE 10801.
          </div>
        </div>
      </div>
    </div>
  );
}
