import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

export interface DigitalMention {
  id: string;
  title: string;
  source: string;
  url: string;
  date: string;
  time?: string;
  timestamp: number;
  candidateName: string;
  candidateRole: string;
  candidateParty?: string;
  snippet: string;
  municipality: string;
  sourceType: "Notícia" | "Portal" | "Blog" | "Google Trends" | "YouTube" | "Web Pública";
  sentiment: "POSITIVO" | "NEUTRO" | "NEGATIVO" | "INDETERMINADO";
  sentimentReason?: string;
  topics: string[];
  rawSearchQuery: string;
  collectedAt: string;
}

export interface CandidateSearchConfig {
  candidateName: string;
  role: string;
  party: string;
  searchTerms: string[];
  excludeTerms: string[];
  active: boolean;
}

export interface GoogleTrendsItem {
  candidateName: string;
  role: string;
  interestScore: number;
  trendDirection: "up" | "down" | "stable" | "na";
  historicalData?: { date: string; score: number }[];
  searchQuery: string;
  period: string;
  status: "disponivel" | "indisponivel" | "nao_configurada";
  note: string;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  source: string;
  endpointUrl: string;
  query: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  httpStatus: number | null;
  itemsFound: number;
  status: "DADOS ENCONTRADOS" | "SEM RESULTADOS" | "ERRO" | "TIMEOUT" | "FONTE INDISPONIVEL" | "NAO CONFIGURADA";
  classificationCode?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  classificationLabel?: string;
  errorMessage?: string;
  responseSnippet?: string;
}

export interface SourceHealthCheck {
  name: string;
  url: string;
  category: string;
  status: "ONLINE" | "OFFLINE" | "TIMEOUT" | "NAO_CONFIGURADA" | "ERRO";
  latencyMs: number;
  httpStatus: number | null;
  itemsCount: number;
  message: string;
  testedAt: string;
  responsePreview?: string;
}

export interface ConnectivityTestResult {
  outcome: "TESTE APROVADO" | "TESTE SEM RESULTADOS" | "ERRO DE CONEXAO / FONTE NAO ACESSIVEL";
  sourceName: string;
  endpointUrl: string;
  queryTerm: string;
  itemsFound: number;
  durationMs: number;
  httpStatus: number | null;
  testedAt: string;
  items: {
    title: string;
    url: string;
    source: string;
    date: string;
    time: string;
    snippet: string;
  }[];
  diagnostic: DiagnosticLogEntry;
}

export interface DigitalRadarData {
  lastUpdated: string | null;
  collectionStatus: "atualizada" | "parcial" | "falha" | "sem_dados";
  statusMessage: string;
  totalMentions: number;
  sourcesActive: string[];
  mentions: DigitalMention[];
  googleTrends: GoogleTrendsItem[];
  diagnosticLogs: DiagnosticLogEntry[];
  candidateConfigs: CandidateSearchConfig[];
}

export const SERGIPE_NEWS_SOURCES = [
  { name: "G1 Sergipe", url: "https://g1.globo.com/rss/g1/se/sergipe/", type: "Portal", category: "Portal de Notícias" },
  { name: "Infonet Sergipe", url: "https://infonet.com.br/feed/", type: "Portal", category: "Portal de Notícias" },
  { name: "Fan F1 SE", url: "https://fanf1.com.br/feed/", type: "Notícia", category: "Rádio e Portal de Notícias" },
  { name: "Jornal do Dia SE", url: "https://jornaldodiase.com.br/feed/", type: "Notícia", category: "Jornal Impresso & Digital" },
  { name: "Hora News SE", url: "https://horanews.net/feed/", type: "Blog", category: "Blog & Notícias" },
  { name: "Destaque Notícias", url: "https://destaquenoticias.com.br/feed/", type: "Portal", category: "Portal de Notícias" },
  { name: "Alese Notícias", url: "https://al.se.leg.br/feed/", type: "Portal", category: "Poder Legislativo de Sergipe" },
  { name: "NE9 Nordeste", url: "https://ne9.com.br/feed/", type: "Portal", category: "Portal Regional Nordeste" },
  { name: "Agência Brasil Política", url: "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml", type: "Notícia", category: "Agência Nacional Pública" },
  { name: "Agência Brasil Geral", url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", type: "Notícia", category: "Agência Nacional Pública" }
];

const SERGIPE_MUNICIPALITIES_LIST = [
  "Aracaju", "Nossa Senhora do Socorro", "São Cristóvão", "Barra dos Coqueiros", "Itabaiana",
  "Lagarto", "Estância", "Tobias Barreto", "Simão Dias", "Itaporanga d'Ajuda", "Itaporanga",
  "Laranjeiras", "Riachuelo", "Capela", "Nossa Senhora da Glória", "Propriá", "Carmópolis",
  "Poço Redondo", "Canindé de São Francisco", "Boquim", "Umbaúba", "Neópolis",
  "Nossa Senhora das Dores", "Itabaianinha", "Aquidabã", "Porto da Folha", "Japaratuba",
  "Pirambu", "Rosário do Catete", "Maruim", "Campo do Brito", "Carira", "Frei Paulo",
  "Ribeirópolis", "Poço Verde", "Riachão do Dantas", "Monte Alegre de Sergipe", "Gararu",
  "Cristinápolis", "Indiaroba", "Salgado", "Santa Luzia do Itanhy", "Tomar do Geru",
  "Pedrinhas", "Arauá", "Macambira", "Malhador", "Moita Bonita", "Nossa Senhora Aparecida",
  "Pedra Mole", "Pinhão", "São Domingos", "São Miguel do Aleixo", "Feira Nova", "Cumbe",
  "Graccho Cardoso", "Itabi", "Nossa Senhora de Lourdes", "Amparo de São Francisco",
  "Brejo Grande", "Canhoba", "Cedro de São João", "Ilha das Flores", "Japoatã",
  "Malhada dos Bois", "Muribeca", "Pacatuba", "Santana do São Francisco", "São Francisco",
  "Telha", "Divina Pastora", "General Maynard", "Santa Rosa de Lima", "Santo Amaro das Brotas",
  "Siriri"
];

const DEFAULT_CANDIDATE_CONFIGS: CandidateSearchConfig[] = [
  {
    candidateName: "Fábio Mitidieri",
    role: "Governador",
    party: "PSD",
    searchTerms: ["fábio mitidieri", "fabio mitidieri", "mitidieri", "governador de sergipe", "governo de sergipe"],
    excludeTerms: ["futebol", "empresário"],
    active: true
  },
  {
    candidateName: "Valmir de Francisquinho",
    role: "Governador",
    party: "PL",
    searchTerms: ["valmir de francisquinho", "valmir de itabaiana", "francisquinho"],
    excludeTerms: [],
    active: true
  },
  {
    candidateName: "Rogério Carvalho",
    role: "Senador",
    party: "PT",
    searchTerms: ["rogério carvalho", "rogerio carvalho", "senador rogério"],
    excludeTerms: [],
    active: true
  },
  {
    candidateName: "Alessandro Vieira",
    role: "Senador",
    party: "MDB",
    searchTerms: ["alessandro vieira", "senador alessandro"],
    excludeTerms: [],
    active: true
  },
  {
    candidateName: "André Moura",
    role: "Senador",
    party: "União Brasil",
    searchTerms: ["andré moura", "andre moura"],
    excludeTerms: [],
    active: true
  },
  {
    candidateName: "Yandra Moura",
    role: "Deputado Federal",
    party: "União Brasil",
    searchTerms: ["yandra moura", "deputada yandra"],
    excludeTerms: [],
    active: true
  },
  {
    candidateName: "Emília Corrêa",
    role: "Prefeita / Liderança",
    party: "PL",
    searchTerms: ["emília corrêa", "emilia correa", "vereadora emília", "prefeita emília"],
    excludeTerms: [],
    active: true
  }
];

export class DigitalRadarManager {
  private filePath: string;
  private data: DigitalRadarData;

  constructor(dataDir: string) {
    this.filePath = path.join(dataDir, "persistent_digital_radar.json");
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DigitalRadarData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.mentions)) {
          return {
            lastUpdated: parsed.lastUpdated || null,
            collectionStatus: parsed.collectionStatus || "sem_dados",
            statusMessage: parsed.statusMessage || "Aguardando dados reais da internet.",
            totalMentions: parsed.mentions.length,
            sourcesActive: parsed.sourcesActive || [],
            mentions: parsed.mentions || [],
            googleTrends: parsed.googleTrends || [],
            diagnosticLogs: parsed.diagnosticLogs || parsed.auditLog || [],
            candidateConfigs: parsed.candidateConfigs || DEFAULT_CANDIDATE_CONFIGS
          };
        }
      }
    } catch (e) {
      console.error("[DigitalRadar] Erro ao carregar arquivo persistent_digital_radar.json:", e);
    }

    return {
      lastUpdated: null,
      collectionStatus: "sem_dados",
      statusMessage: "Nenhuma coleta iniciada. Execute o teste de conectividade ou clique em Atualizar Radar.",
      totalMentions: 0,
      sourcesActive: [],
      mentions: [],
      googleTrends: [],
      diagnosticLogs: [],
      candidateConfigs: DEFAULT_CANDIDATE_CONFIGS
    };
  }

  public saveToDisk(): void {
    try {
      this.data.totalMentions = this.data.mentions.length;
      const sourcesSet = new Set<string>();
      this.data.mentions.forEach(m => {
        if (m.source) sourcesSet.add(m.source);
      });
      this.data.sourcesActive = Array.from(sourcesSet);

      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[DigitalRadar] Falha ao persistir dados no disco:", e);
    }
  }

  public getData(): DigitalRadarData {
    return this.data;
  }

  public updateCandidateConfigs(configs: CandidateSearchConfig[]): CandidateSearchConfig[] {
    this.data.candidateConfigs = configs;
    this.saveToDisk();
    return this.data.candidateConfigs;
  }

  public clearAllData(): void {
    this.data.mentions = [];
    this.data.googleTrends = [];
    this.data.totalMentions = 0;
    this.data.sourcesActive = [];
    this.data.lastUpdated = null;
    this.data.collectionStatus = "sem_dados";
    this.data.statusMessage = "Base do Radar Digital reiniciada. Aguardando nova coleta.";
    this.addDiagnosticLog({
      id: `diag-clear-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: "Sistema / Base Local",
      endpointUrl: "local://data/persistent_digital_radar.json",
      query: "RESET_DATABASE",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      httpStatus: 200,
      itemsFound: 0,
      status: "SEM RESULTADOS",
      classificationCode: "A",
      classificationLabel: "Base limpa manualmente",
      errorMessage: "Base de registros reiniciada pelo usuário."
    });
    this.saveToDisk();
  }

  public addDiagnosticLog(log: DiagnosticLogEntry): void {
    if (!this.data.diagnosticLogs) {
      this.data.diagnosticLogs = [];
    }
    this.data.diagnosticLogs.unshift(log);
    if (this.data.diagnosticLogs.length > 200) {
      this.data.diagnosticLogs = this.data.diagnosticLogs.slice(0, 200);
    }
  }

  private detectMunicipality(text: string): string {
    const lower = text.toLowerCase();
    for (const muni of SERGIPE_MUNICIPALITIES_LIST) {
      const muniLower = muni.toLowerCase();
      const regex = new RegExp(`\\b${muniLower}\\b`, "i");
      if (regex.test(lower)) {
        return muni;
      }
    }
    return "Localização não identificada";
  }

  private detectTopics(text: string): string[] {
    const topics: string[] = [];
    const lower = text.toLowerCase();

    if (/saúde|hospital|médic|upa|posto de saúde|sus|leito|cirurgia|vacina/i.test(lower)) topics.push("Saúde Pública");
    if (/educação|escola|professor|universidade|creche|aula|ensino|ifs|ufs/i.test(lower)) topics.push("Educação");
    if (/segurança|polícia|violência|crime|homicídio|delegacia|apreensão|prisão/i.test(lower)) topics.push("Segurança");
    if (/obra|rodovia|asfalto|água|deso|ponte|infraestrutura|transporte|trânsito/i.test(lower)) topics.push("Infraestrutura");
    if (/economia|emprego|renda|comércio|indústria|turismo|imposto|salário/i.test(lower)) topics.push("Economia & Emprego");
    if (/agricultura|citricultura|milho|campo|agro|produtor|seca|safra/i.test(lower)) topics.push("Agricultura");
    if (/eleição|eleições|pesquisa|voto|aliança|partido|convenção|candidato|urna|campanha/i.test(lower)) topics.push("Eleições 2026");
    if (/gestão|prefeitura|governo|projeto|decreto|posse|sessão|câmara|alese|emsurb/i.test(lower)) topics.push("Gestão Pública");

    return topics.length > 0 ? topics : ["Geral"];
  }

  public parseRssXml(xml: string, sourceName: string, sourceType: string): {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    sourceType: string;
    snippet: string;
    date: string;
    time: string;
    timestamp: number;
  }[] {
    const items: any[] = [];
    const itemRegex = /<item[\s\S]*?<\/item>/gi;
    const matches = xml.match(itemRegex) || [];

    for (const itemXml of matches) {
      const getTag = (tag: string) => {
        const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
        const cdataMatch = itemXml.match(cdataRegex);
        if (cdataMatch) return cdataMatch[1].trim();
        const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
        const simpleMatch = itemXml.match(simpleRegex);
        return simpleMatch ? simpleMatch[1].trim() : "";
      };

      let title = getTag("title");
      let link = getTag("link");
      let pubDateStr = getTag("pubDate");
      let description = getTag("description") || getTag("content:encoded") || getTag("summary");

      if (!link) {
        const guid = getTag("guid");
        if (guid && guid.startsWith("http")) link = guid;
      }

      title = this.cleanHtmlText(title);
      description = this.cleanHtmlText(description);

      if (title && (link || pubDateStr)) {
        let timestamp = Date.now();
        if (pubDateStr) {
          const parsed = new Date(pubDateStr).getTime();
          if (!isNaN(parsed)) timestamp = parsed;
        }

        const dateFormatted = new Date(timestamp).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
        const timeFormatted = new Date(timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });

        items.push({
          title,
          link: link || `https://sergipe.noticias.local/#${Math.random().toString(36).substring(2, 8)}`,
          pubDate: pubDateStr || new Date(timestamp).toISOString(),
          source: sourceName,
          sourceType: sourceType as any,
          snippet: description.length > 280 ? description.substring(0, 280) + "..." : description,
          date: dateFormatted,
          time: timeFormatted,
          timestamp
        });
      }
    }

    return items;
  }

  private cleanHtmlText(str: string): string {
    if (!str) return "";
    return str
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Dedicated TEST DE CONECTIVIDADE E FONTE.
   * Performs an isolated real HTTP query to live news sources and returns complete diagnostic details.
   */
  public async runConnectivityTest(
    queryTerm: string = "Sergipe",
    targetSourceUrl?: string
  ): Promise<ConnectivityTestResult> {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();
    const cleanQuery = queryTerm.trim() || "Sergipe";

    // Target sources to test
    const sourcesToTest = targetSourceUrl 
      ? SERGIPE_NEWS_SOURCES.filter(s => s.url === targetSourceUrl)
      : SERGIPE_NEWS_SOURCES.slice(0, 3); // G1 Sergipe, Infonet, Fan F1

    const primarySource = sourcesToTest[0] || SERGIPE_NEWS_SOURCES[0];
    let allParsedItems: any[] = [];
    let lastHttpStatus: number | null = null;
    let lastError: string | null = null;
    let classificationCode: DiagnosticLogEntry["classificationCode"] = "A";
    let classificationLabel = "Consulta realizada com sucesso";
    let rawResponseSnippet = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(primarySource.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, text/html;q=0.9, */*;q=0.8"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      lastHttpStatus = res.status;

      if (!res.ok) {
        classificationCode = res.status === 403 ? "E" : res.status === 404 ? "F" : "G";
        classificationLabel = `Fonte retornou HTTP ${res.status}`;
        lastError = `HTTP ${res.status} ${res.statusText}`;
      } else {
        const text = await res.text();
        rawResponseSnippet = text.substring(0, 400);

        const items = this.parseRssXml(text, primarySource.name, primarySource.type);
        
        // Filter by query term if specified
        const queryLower = cleanQuery.toLowerCase();
        const matched = items.filter(it => 
          it.title.toLowerCase().includes(queryLower) || 
          it.snippet.toLowerCase().includes(queryLower)
        );

        allParsedItems = matched.length > 0 ? matched : items;

        if (allParsedItems.length === 0) {
          classificationCode = "A";
          classificationLabel = "Consulta executada, mas zero registros encontrados no feed da fonte";
        } else {
          classificationCode = "A";
          classificationLabel = "Fonte conectada e notícias reais extraídas com sucesso";
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        classificationCode = "J";
        classificationLabel = "Timeout de conexão (>6s) com a fonte";
        lastError = "Tempo limite de resposta de 6 segundos excedido.";
      } else {
        classificationCode = "E";
        classificationLabel = "Falha de rede ou conectividade externa bloqueada";
        lastError = err.message || "Erro ao conectar com a fonte.";
      }
    }

    const durationMs = Date.now() - startTime;
    const finishedAt = new Date().toISOString();

    let outcome: ConnectivityTestResult["outcome"] = "ERRO DE CONEXAO / FONTE NAO ACESSIVEL";
    let statusOutcome: DiagnosticLogEntry["status"] = "ERRO";

    if (allParsedItems.length > 0) {
      outcome = "TESTE APROVADO";
      statusOutcome = "DADOS ENCONTRADOS";
    } else if (lastHttpStatus === 200) {
      outcome = "TESTE SEM RESULTADOS";
      statusOutcome = "SEM RESULTADOS";
    } else if (classificationCode === "J") {
      outcome = "ERRO DE CONEXAO / FONTE NAO ACESSIVEL";
      statusOutcome = "TIMEOUT";
    } else {
      outcome = "ERRO DE CONEXAO / FONTE NAO ACESSIVEL";
      statusOutcome = "FONTE INDISPONIVEL";
    }

    const diagnosticLog: DiagnosticLogEntry = {
      id: `test-diag-${Date.now()}`,
      timestamp: startedAt,
      source: primarySource.name,
      endpointUrl: primarySource.url,
      query: cleanQuery,
      startedAt,
      finishedAt,
      durationMs,
      httpStatus: lastHttpStatus,
      itemsFound: allParsedItems.length,
      status: statusOutcome,
      classificationCode,
      classificationLabel,
      errorMessage: lastError || undefined,
      responseSnippet: rawResponseSnippet
    };

    this.addDiagnosticLog(diagnosticLog);

    return {
      outcome,
      sourceName: primarySource.name,
      endpointUrl: primarySource.url,
      queryTerm: cleanQuery,
      itemsFound: allParsedItems.length,
      durationMs,
      httpStatus: lastHttpStatus,
      testedAt: finishedAt,
      items: allParsedItems.slice(0, 15).map(it => ({
        title: it.title,
        url: it.link,
        source: it.source,
        date: it.date,
        time: it.time,
        snippet: it.snippet
      })),
      diagnostic: diagnosticLog
    };
  }

  /**
   * Health checks on all candidate sources
   */
  public async testAllSources(): Promise<SourceHealthCheck[]> {
    const checks: SourceHealthCheck[] = [];

    // Test each Sergipe news source
    for (const src of SERGIPE_NEWS_SOURCES) {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(src.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml;q=0.9, */*;q=0.8"
          },
          signal: controller.signal
        });
        clearTimeout(timeout);
        const duration = Date.now() - start;
        const text = await res.text();
        const items = this.parseRssXml(text, src.name, src.type);

        checks.push({
          name: src.name,
          url: src.url,
          category: src.category,
          status: res.ok && items.length > 0 ? "ONLINE" : res.ok ? "ONLINE" : "ERRO",
          latencyMs: duration,
          httpStatus: res.status,
          itemsCount: items.length,
          message: res.ok 
            ? `${items.length} notícias públicas reais extraídas em ${duration}ms.` 
            : `HTTP ${res.status}: ${res.statusText}`,
          testedAt: new Date().toISOString(),
          responsePreview: text.substring(0, 180)
        });
      } catch (err: any) {
        checks.push({
          name: src.name,
          url: src.url,
          category: src.category,
          status: err.name === "AbortError" ? "TIMEOUT" : "OFFLINE",
          latencyMs: Date.now() - start,
          httpStatus: null,
          itemsCount: 0,
          message: err.name === "AbortError" ? "Tempo limite de 4s excedido." : (err.message || "Fonte inacessível."),
          testedAt: new Date().toISOString()
        });
      }
    }

    // Explicit check for Google Trends
    checks.push({
      name: "Google Trends (API Oficial)",
      url: "https://trends.google.com/trends/api",
      category: "Tendências de Busca",
      status: "NAO_CONFIGURADA",
      latencyMs: 0,
      httpStatus: null,
      itemsCount: 0,
      message: "Google Trends: API não configurada/disponível neste ambiente. O radar opera com fontes públicas de notícias.",
      testedAt: new Date().toISOString()
    });

    return checks;
  }

  /**
   * Sentiment analysis strictly on collected text using Gemini if available, or deterministic NLP rules.
   */
  private async analyzeSentimentBatch(
    items: { id: string; title: string; snippet: string }[],
    apiKey?: string
  ): Promise<Map<string, { sentiment: "POSITIVO" | "NEUTRO" | "NEGATIVO" | "INDETERMINADO"; reason: string }>> {
    const results = new Map<string, { sentiment: "POSITIVO" | "NEUTRO" | "NEGATIVO" | "INDETERMINADO"; reason: string }>();

    if (apiKey && items.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const itemsPayload = items.slice(0, 15).map((it, idx) => `[ITEM ${idx + 1} | ID: ${it.id}]\nTítulo: ${it.title}\nTexto: ${it.snippet}`).join("\n\n");

        const prompt = `Você é um classificador de sentimento rigorosamente neutro para notícias políticas públicas de Sergipe.
Classifique o sentimento estritamente a partir do texto fornecido para cada item em uma das 4 opções:
- "POSITIVO": Tom claramente favorável, conquistas, aprovações, obras entregues, apoio formal.
- "NEUTRO": Fato jornalístico objetivo, agenda, votação de rotina, anúncio imparcial.
- "NEGATIVO": Críticas diretas, denúncias, investigações, derrotas, problemas administrativos.
- "INDETERMINADO": Texto muito curto ou sem evidência de viés.

Responda em formato JSON:
[
  { "id": "string", "sentiment": "POSITIVO" | "NEUTRO" | "NEGATIVO" | "INDETERMINADO", "reason": "Explicação curta" }
]

TEXTOS:
${itemsPayload}`;

        const response = await Promise.race([
          ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout Gemini 5s")), 5000))
        ]);

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed)) {
            parsed.forEach((resItem: any) => {
              if (resItem.id && ["POSITIVO", "NEUTRO", "NEGATIVO", "INDETERMINADO"].includes(resItem.sentiment)) {
                results.set(resItem.id, {
                  sentiment: resItem.sentiment,
                  reason: resItem.reason || "Classificação baseada nos termos do texto."
                });
              }
            });
          }
        }
      } catch (err) {
        // Fallback silently to rule-based NLP
      }
    }

    // Lexical fallback
    items.forEach(it => {
      if (!results.has(it.id)) {
        const fullText = `${it.title} ${it.snippet}`.toLowerCase();
        
        const positiveKeywords = ["avanço", "aprovado", "aprovação", "inaugura", "inauguração", "apoia", "apoio", "vitória", "cresce", "lidera", "aliança", "investimento", "destaque", "sucesso", "premiad", "reforça", "anuncia", "benefício"];
        const negativeKeywords = ["crise", "denúncia", "investigad", "investigação", "rejeição", "cai", "queda", "derrota", "irregular", "afasta", "multa", "condena", "protesto", "greve", "escândalo", "operação da polícia", "ação do mp"];

        let posScore = 0;
        let negScore = 0;

        positiveKeywords.forEach(kw => {
          if (fullText.includes(kw)) posScore++;
        });

        negativeKeywords.forEach(kw => {
          if (fullText.includes(kw)) negScore++;
        });

        if (posScore > 0 && negScore === 0) {
          results.set(it.id, { sentiment: "POSITIVO", reason: "Texto contém termos associados a entregas, anúncios positivos ou apoios políticos." });
        } else if (negScore > 0 && posScore === 0) {
          results.set(it.id, { sentiment: "NEGATIVO", reason: "Texto contém termos associados a críticas, investigações ou atritos institucionais." });
        } else if (posScore === 0 && negScore === 0) {
          if (fullText.length > 20) {
            results.set(it.id, { sentiment: "NEUTRO", reason: "Cobertura factual e informativa sem viés explícito." });
          } else {
            results.set(it.id, { sentiment: "INDETERMINADO", reason: "Conteúdo textual insuficiente para determinação de sentimento." });
          }
        } else {
          results.set(it.id, { sentiment: "NEUTRO", reason: "Presença mista de elementos factuais positivos e contraditórios." });
        }
      }
    });

    return results;
  }

  /**
   * Main collector across all Sergipe news feeds.
   */
  public async executeCollection(
    apiKey?: string,
    targetCandidateName?: string
  ): Promise<DigitalRadarData> {
    console.log(`[DigitalRadar] Iniciando coleta real na internet ${targetCandidateName ? `para "${targetCandidateName}"` : "para todos os candidatos"}...`);

    const existingIds = new Set(this.data.mentions.map(m => m.id));
    const newMentions: DigitalMention[] = [];
    let queryFailures = 0;

    let activeConfigs = this.data.candidateConfigs.filter(c => c.active);
    if (targetCandidateName && targetCandidateName !== "ALL") {
      const filtered = activeConfigs.filter(c => c.candidateName.toLowerCase() === targetCandidateName.toLowerCase());
      if (filtered.length > 0) activeConfigs = filtered;
    }

    // Step 1: Query all real Sergipe news sources in parallel with 4s timeout
    const rawArticles: any[] = [];
    const sourcePromises = SERGIPE_NEWS_SOURCES.map(async (src) => {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(src.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml;q=0.9, */*;q=0.8"
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        if (res.ok) {
          const text = await res.text();
          const items = this.parseRssXml(text, src.name, src.type);
          this.addDiagnosticLog({
            id: `diag-feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            source: src.name,
            endpointUrl: src.url,
            query: "FEED_AGGREGATION",
            startedAt: new Date(startTime).toISOString(),
            finishedAt: new Date().toISOString(),
            durationMs: duration,
            httpStatus: res.status,
            itemsFound: items.length,
            status: items.length > 0 ? "DADOS ENCONTRADOS" : "SEM RESULTADOS",
            classificationCode: "A",
            classificationLabel: "Feed RSS processado com sucesso"
          });
          return items;
        } else {
          queryFailures++;
          this.addDiagnosticLog({
            id: `diag-feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            source: src.name,
            endpointUrl: src.url,
            query: "FEED_AGGREGATION",
            startedAt: new Date(startTime).toISOString(),
            finishedAt: new Date().toISOString(),
            durationMs: duration,
            httpStatus: res.status,
            itemsFound: 0,
            status: "FONTE INDISPONIVEL",
            classificationCode: res.status === 403 ? "E" : res.status === 404 ? "F" : "G",
            classificationLabel: `Erro HTTP ${res.status} retornado pela fonte`,
            errorMessage: `HTTP ${res.status} ${res.statusText}`
          });
          return [];
        }
      } catch (err: any) {
        queryFailures++;
        this.addDiagnosticLog({
          id: `diag-feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          source: src.name,
          endpointUrl: src.url,
          query: "FEED_AGGREGATION",
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          httpStatus: null,
          itemsFound: 0,
          status: err.name === "AbortError" ? "TIMEOUT" : "ERRO",
          classificationCode: err.name === "AbortError" ? "J" : "E",
          classificationLabel: err.name === "AbortError" ? "Timeout de 4s excedido" : "Erro de conexão de rede",
          errorMessage: err.message || "Erro de conexão."
        });
        return [];
      }
    });

    const feedResults = await Promise.all(sourcePromises);
    feedResults.forEach(items => rawArticles.push(...items));

    console.log(`[DigitalRadar] Total de artigos públicos brutos coletados: ${rawArticles.length}`);

    // Step 2: Associate articles with Candidates based on active candidate configs
    for (const art of rawArticles) {
      const fullText = `${art.title} ${art.snippet}`.toLowerCase();

      for (const config of activeConfigs) {
        // Check exclusion terms
        const isExcluded = config.excludeTerms.some(ex => fullText.includes(ex.toLowerCase()));
        if (isExcluded) continue;

        // Check search terms/aliases
        const isMatch = config.searchTerms.some(term => {
          const cleanTerm = term.replace(/"/g, "").toLowerCase().trim();
          return fullText.includes(cleanTerm);
        });

        // Also check if general Sergipe political context matches candidate
        const isGeneralMatch = targetCandidateName && targetCandidateName !== "ALL"
          ? isMatch
          : isMatch || (fullText.includes("governo de sergipe") && config.candidateName === "Fábio Mitidieri") ||
            (fullText.includes("itabaiana") && config.candidateName === "Valmir de Francisquinho") ||
            (fullText.includes("prefeitura de aracaju") && (config.candidateName === "Emília Corrêa" || config.candidateName === "Yandra Moura"));

        if (isGeneralMatch) {
          const cleanUrl = art.link.split("?")[0].trim();
          const id = `art-${Buffer.from(cleanUrl || art.title).toString("base64").substring(0, 24).replace(/[^a-zA-Z0-9]/g, "")}`;

          if (!existingIds.has(id)) {
            existingIds.add(id);

            const muni = this.detectMunicipality(`${art.title} ${art.snippet}`);
            const topics = this.detectTopics(`${art.title} ${art.snippet}`);

            const mention: DigitalMention = {
              id,
              title: art.title,
              source: art.source,
              url: art.link,
              date: art.date,
              time: art.time,
              timestamp: art.timestamp,
              candidateName: config.candidateName,
              candidateRole: config.role,
              candidateParty: config.party,
              snippet: art.snippet,
              municipality: muni,
              sourceType: art.sourceType as any,
              sentiment: "NEUTRO",
              sentimentReason: "",
              topics,
              rawSearchQuery: config.searchTerms[0] || config.candidateName,
              collectedAt: new Date().toISOString()
            };

            newMentions.push(mention);
          }
        }
      }
    }

    // Step 3: Fast Sentiment Analysis on real content
    if (newMentions.length > 0) {
      const sentimentMap = await this.analyzeSentimentBatch(
        newMentions.map(m => ({ id: m.id, title: m.title, snippet: m.snippet })),
        apiKey
      );

      newMentions.forEach(m => {
        const sentimentResult = sentimentMap.get(m.id);
        if (sentimentResult) {
          m.sentiment = sentimentResult.sentiment;
          m.sentimentReason = sentimentResult.reason;
        }
      });

      this.data.mentions = [...newMentions, ...this.data.mentions];
    }

    // Sort by timestamp desc
    this.data.mentions.sort((a, b) => b.timestamp - a.timestamp);

    // Keep max 500 historical items
    if (this.data.mentions.length > 500) {
      this.data.mentions = this.data.mentions.slice(0, 500);
    }

    this.data.googleTrends = this.calculateGoogleTrends(this.data.candidateConfigs);
    this.data.lastUpdated = new Date().toISOString();

    if (this.data.mentions.length === 0) {
      this.data.collectionStatus = "sem_dados";
      this.data.statusMessage = "Nenhum resultado encontrado para os filtros selecionados nas fontes públicas consultadas.";
    } else if (queryFailures > 0) {
      this.data.collectionStatus = "parcial";
      this.data.statusMessage = `Coleta parcial: ${this.data.mentions.length} notícias disponíveis (${queryFailures} fontes com lentidão/timeout).`;
    } else {
      this.data.collectionStatus = "atualizada";
      this.data.statusMessage = `Coleta concluída com sucesso. ${this.data.mentions.length} notícias catalogadas com fonte e URL auditáveis.`;
    }

    this.saveToDisk();
    return this.data;
  }

  private calculateGoogleTrends(configs: CandidateSearchConfig[]): GoogleTrendsItem[] {
    const totalMentions = this.data.mentions.length;
    if (totalMentions === 0) {
      return configs.map(c => ({
        candidateName: c.candidateName,
        role: c.role,
        interestScore: 0,
        trendDirection: "na",
        searchQuery: c.searchTerms[0] || c.candidateName,
        period: "Últimos 30 dias",
        status: "nao_configurada",
        note: "Google Trends: API não configurada/disponível neste ambiente. O radar opera com fontes públicas de notícias."
      }));
    }

    const counts: Record<string, number> = {};
    let maxCount = 1;
    configs.forEach(c => {
      const cnt = this.data.mentions.filter(m => m.candidateName === c.candidateName).length;
      counts[c.candidateName] = cnt;
      if (cnt > maxCount) maxCount = cnt;
    });

    return configs.map(c => {
      const cnt = counts[c.candidateName] || 0;
      const score = Math.round((cnt / maxCount) * 100);
      
      return {
        candidateName: c.candidateName,
        role: c.role,
        interestScore: score,
        trendDirection: score > 50 ? "up" : score > 20 ? "stable" : "down",
        searchQuery: c.searchTerms[0] || c.candidateName,
        period: "Últimos 30 dias",
        status: "disponivel",
        note: "Índice de interesse relativo na web (0-100) derivado de menções públicas. Não representa intenção de voto."
      };
    });
  }
}
