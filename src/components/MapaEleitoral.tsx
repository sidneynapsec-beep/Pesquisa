import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Territory, Poll } from "../types";
import { useElectoralData } from "../context/ElectoralDataContext";
import {
  SERGIPE_MUNICIPALITIES,
  SERGIPE_TERRITORIOS,
  getOfficialCandidateColor
} from "../data/sergipeData";
import {
  CANDIDATOS_OFICIAIS_2026,
  OfficialCandidate2026
} from "../data/candidatosOficiais2026";
import { SERGIPE_75_MUNICIPIOS } from "../data/tseSergipeMunicipios";
import { parseFlexibleDate } from "../utils/fileParser";
import { getPollDateBR } from "../utils/dateFormatter";
import {
  Map,
  Search,
  Info,
  MapPin,
  Users,
  Award,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertCircle,
  Filter,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Database,
  Layers,
  Download,
  Calendar,
  Building2,
  FileSpreadsheet
} from "lucide-react";

interface MapaEleitoralProps {
  territories: Territory[];
}

type RoleFilter = "Governador" | "Senador" | "Deputado Federal" | "Deputado Estadual";

// Coordinates dictionary for all 75 canonical Sergipe municipalities
const MUNICIPALITY_GEOLOCATIONS: { [key: string]: [number, number] } = {
  // 1. Grande Aracaju (8 municípios)
  "Aracaju": [-10.9472, -37.0731],
  "Barra dos Coqueiros": [-10.9085, -37.0427],
  "Itaporanga d'Ajuda": [-11.0022, -37.3093],
  "Laranjeiras": [-10.8037, -37.1691],
  "Maruim": [-10.7381, -37.0817],
  "Nossa Senhora do Socorro": [-10.8569, -37.1264],
  "Riachuelo": [-10.7250, -37.1906],
  "São Cristóvão": [-10.9996, -37.2023],

  // 2. Agreste Central (14 municípios)
  "Areia Branca": [-10.7602, -37.3197],
  "Campo do Brito": [-10.7328, -37.4939],
  "Carira": [-10.3585, -37.7012],
  "Frei Paulo": [-10.5487, -37.5342],
  "Itabaiana": [-10.6865, -37.4262],
  "Macambira": [-10.7188, -37.5434],
  "Malhador": [-10.6586, -37.3039],
  "Moita Bonita": [-10.5772, -37.3429],
  "Nossa Senhora Aparecida": [-10.4431, -37.4889],
  "Pedra Mole": [-10.6186, -37.6836],
  "Pinhão": [-10.5678, -37.7214],
  "Ribeirópolis": [-10.5392, -37.4194],
  "São Domingos": [-10.6322, -37.5681],
  "São Miguel do Aleixo": [-10.3889, -37.4819],

  // 3. Centro Sul (5 municípios)
  "Lagarto": [-10.9168, -37.6631],
  "Poço Verde": [-10.7078, -38.1812],
  "Riachão do Dantas": [-11.0667, -37.7214],
  "Simão Dias": [-10.9859, -37.8106],
  "Tobias Barreto": [-11.1864, -37.9942],

  // 4. Alto Sertão (7 municípios)
  "Canindé de São Francisco": [-9.6433, -37.7885],
  "Gararu": [-9.9675, -37.0867],
  "Monte Alegre de Sergipe": [-10.0264, -37.5614],
  "Nossa Senhora da Glória": [-10.2185, -37.4191],
  "Nossa Senhora de Lourdes": [-10.0825, -37.0547],
  "Poço Redondo": [-9.8058, -37.6811],
  "Porto da Folha": [-9.9142, -37.2797],

  // 5. Médio Sertão (6 municípios)
  "Aquidabã": [-10.2811, -37.0208],
  "Cumbe": [-10.3547, -37.1814],
  "Feira Nova": [-10.2667, -37.3167],
  "Graccho Cardoso": [-10.2225, -37.1942],
  "Itabi": [-10.1264, -37.1031],
  "Nossa Senhora das Dores": [-10.4908, -37.1917],

  // 6. Baixo São Francisco (14 municípios)
  "Amparo de São Francisco": [-10.2186, -36.9317],
  "Brejo Grande": [-10.4344, -36.4631],
  "Canhoba": [-10.1333, -36.9833],
  "Cedro de São João": [-10.2514, -36.8833],
  "Ilha das Flores": [-10.4358, -36.5369],
  "Japoatã": [-10.3478, -36.7933],
  "Malhada dos Bois": [-10.3503, -36.9242],
  "Muribeca": [-10.4286, -36.8967],
  "Neópolis": [-10.3236, -36.5794],
  "Pacatuba": [-10.4533, -36.6517],
  "Propriá": [-10.2106, -36.8378],
  "Santana do São Francisco": [-10.2858, -36.6083],
  "São Francisco": [-10.3411, -36.8778],
  "Telha": [-10.2078, -36.8836],

  // 7. Leste Sergipano (10 municípios)
  "Capela": [-10.4042, -37.0544],
  "Carmópolis": [-10.6481, -36.9856],
  "Divina Pastora": [-10.6789, -37.1417],
  "General Maynard": [-10.6908, -36.9844],
  "Japaratuba": [-10.5925, -36.9422],
  "Pirambu": [-10.7417, -36.8522],
  "Rosário do Catete": [-10.6958, -37.0289],
  "Santa Rosa de Lima": [-10.7111, -37.1942],
  "Santo Amaro das Brotas": [-10.7878, -36.9897],
  "Siriri": [-10.6028, -37.1147],

  // 8. Sul Sergipano (11 municípios)
  "Arauá": [-11.2611, -37.6208],
  "Boquim": [-11.1461, -37.6214],
  "Cristinápolis": [-11.4744, -37.7561],
  "Estância": [-11.2681, -37.4381],
  "Indiaroba": [-11.5192, -37.5117],
  "Itabaianinha": [-11.2728, -37.7889],
  "Pedrinhas": [-11.1919, -37.6744],
  "Salgado": [-11.0319, -37.4764],
  "Santa Luzia do Itanhy": [-11.3533, -37.4475],
  "Tomar do Geru": [-11.3739, -37.8406],
  "Umbaúba": [-11.3831, -37.6575]
};

const ROLES_LIST: RoleFilter[] = [
  "Governador",
  "Senador",
  "Deputado Federal",
  "Deputado Estadual"
];

export default function MapaEleitoral({ territories }: MapaEleitoralProps) {
  const globalContext = useElectoralData();

  // Base selector state: "ALL" = Consolidado de Todas as Pesquisas Salvas no Diagnóstico, ou ID de pesquisa específica
  const [selectedBaseId, setSelectedBaseId] = useState<string>("ALL");

  // Selected cargo and candidate filters
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("Governador");
  const [selectedCandidateNumber, setSelectedCandidateNumber] = useState<string>("ALL"); // "ALL" = Visão Geral Líderes
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>("");

  // Selected municipality state
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState<string>("Aracaju");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof SERGIPE_MUNICIPALITIES>([]);
  const [activeSideTab, setActiveSideTab] = useState<"municipio" | "territorios" | "metodologia">("municipio");

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Check if real survey data exists
  const hasPollsData = useMemo(() => {
    return Boolean(globalContext?.polls && globalContext.polls.length > 0);
  }, [globalContext?.polls]);

  // Candidates for the active role from the official 2026 database
  const officialCandidatesForRole = useMemo(() => {
    return CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === selectedRole);
  }, [selectedRole]);

  // Currently selected official candidate entity (if any)
  const selectedOfficialCandidate = useMemo(() => {
    if (selectedCandidateNumber === "ALL") return null;
    return officialCandidatesForRole.find((c) => c.number === selectedCandidateNumber) || null;
  }, [officialCandidatesForRole, selectedCandidateNumber]);

  // When changing role, reset candidate selection if not matching
  const handleRoleChange = useCallback((role: RoleFilter) => {
    setSelectedRole(role);
    setSelectedCandidateNumber("ALL");
    setCandidateSearchQuery("");
  }, []);

  // Filtered candidate options for the dropdown selector
  const availableCandidateOptions = useMemo(() => {
    if (!candidateSearchQuery.trim()) {
      return officialCandidatesForRole;
    }
    const q = candidateSearchQuery.toLowerCase();
    return officialCandidatesForRole.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.number.includes(q) ||
        c.partyNumber.includes(q) ||
        (c.coalition && c.coalition.toLowerCase().includes(q))
    );
  }, [officialCandidatesForRole, candidateSearchQuery]);

  // List of saved polls in Diagnostico
  const savedPollsList = useMemo(() => {
    return globalContext?.polls || [];
  }, [globalContext?.polls]);

  // Active Research / Base metadata and statistical calculations
  const activeBaseSummary = useMemo(() => {
    if (!hasPollsData) {
      return {
        id: "EMPTY",
        title: "Nenhuma base cadastrada",
        totalPolls: 0,
        totalInterviews: 0,
        marginOfError: 0,
        confidenceLevel: 95,
        periodText: "Sem coletas registradas",
        institutesText: "Nenhum",
        statisticianText: "Nenhum",
        isConsolidated: false
      };
    }

    if (selectedBaseId === "ALL") {
      const polls = globalContext!.polls;
      const totalInterviews = polls.reduce((sum, p) => sum + (p.sampleSize || 1000), 0);
      const weightedMargin = totalInterviews > 0
        ? polls.reduce((sum, p) => sum + (p.marginOfError || 3.0) * (p.sampleSize || 1000), 0) / totalInterviews
        : 3.0;

      const institutes = Array.from(new Set(polls.map(p => p.institute || "CTAS").filter(Boolean)));
      const statisticians = Array.from(new Set(polls.map(p => p.statistician || "Sidney Barreto Batista").filter(Boolean)));

      // Collect dates
      const dates = polls.map(p => {
        return parseFlexibleDate(p.medianDate || p.fieldworkEnd || p.fieldworkStart || (p as any).dataPesquisa || (p as any).date);
      }).filter(Boolean).sort() as string[];

      let periodText = "Série Histórica Consolidada 2026";
      if (dates.length > 0) {
        const first = dates[0].split("-").reverse().join("/");
        const last = dates[dates.length - 1].split("-").reverse().join("/");
        periodText = first === last ? first : `${first} a ${last}`;
      }

      return {
        id: "ALL",
        title: `Consolidado de Todas as Bases (${polls.length} Pesquisas Salvas)`,
        totalPolls: polls.length,
        totalInterviews,
        marginOfError: parseFloat(weightedMargin.toFixed(2)),
        confidenceLevel: 95,
        periodText,
        institutesText: institutes.join(", ") || "CTAS Inteligência",
        statisticianText: statisticians.join(", ") || "Sidney Barreto Batista (CONRE 10801)",
        isConsolidated: true
      };
    } else {
      const p = globalContext!.polls.find(item => item.id === selectedBaseId) || globalContext!.polls[0];
      const d = parseFlexibleDate(p.medianDate || p.fieldworkEnd || p.fieldworkStart || (p as any).dataPesquisa);
      const formattedDate = d ? d.split("-").reverse().join("/") : "Data não informada";

      return {
        id: p.id,
        title: `${p.institute || "Pesquisa"} • ${formattedDate} (N=${(p.sampleSize || 1000).toLocaleString()})`,
        totalPolls: 1,
        totalInterviews: p.sampleSize || 1000,
        marginOfError: p.marginOfError || 3.0,
        confidenceLevel: p.confidenceLevel || 95,
        periodText: `${p.fieldworkStart || formattedDate} a ${p.fieldworkEnd || formattedDate}`,
        institutesText: p.institute || "CTAS",
        statisticianText: p.statistician || "Sidney Barreto Batista (CONRE 10801)",
        isConsolidated: false
      };
    }
  }, [hasPollsData, selectedBaseId, globalContext?.polls]);

  // Full-Stack Dynamic Dataset derived strictly from official 2026 candidates and ALL/SELECTED survey data
  const fullDataset = useMemo(() => {
    if (!hasPollsData) {
      const emptyMunicipalities = SERGIPE_MUNICIPALITIES.map((m) => ({
        ...m,
        votesShare: {} as { [c: string]: number },
        absoluteVotes: {} as { [c: string]: number },
        leaderName: null as string | null,
        leaderNumber: null as string | null,
        leaderPct: 0,
        selectedCandidatePct: 0
      }));

      return {
        hasData: false,
        municipalities: emptyMunicipalities,
        territories: {} as { [tName: string]: { [c: string]: number } },
        state: {} as { [c: string]: number },
        totalStateVoters: SERGIPE_MUNICIPALITIES.reduce((acc, m) => acc + m.voters, 0)
      };
    }

    const polls = globalContext!.polls;
    const uploadedDatasets = globalContext?.uploadedDatasets || [];
    const territorialAnalysis = globalContext?.territorialAnalysis || [];

    // Check whether we are aggregating ALL polls or a specific poll
    let targetPolls: Poll[] = [];
    if (selectedBaseId === "ALL") {
      targetPolls = polls;
    } else {
      const found = polls.find((p) => p.id === selectedBaseId);
      targetPolls = found ? [found] : [polls[polls.length - 1]];
    }

    // Aggregate municipal tally across all selected datasets
    const aggregatedMuniTally: Record<string, { validVotes: number; candidateCounts: Record<string, number> }> = {};

    // 1. Process uploaded datasets microdata if available
    uploadedDatasets.forEach((dataset) => {
      const roleData = dataset.territorialRoleBreakdown?.[selectedRole] as unknown as Record<string, { validVotes: number; candidateCounts: Record<string, number> }> | undefined;
      if (roleData) {
        Object.entries(roleData).forEach(([muniName, tally]) => {
          if (!aggregatedMuniTally[muniName]) {
            aggregatedMuniTally[muniName] = { validVotes: 0, candidateCounts: {} };
          }
          if (tally && typeof tally.validVotes === "number") {
            aggregatedMuniTally[muniName].validVotes += tally.validVotes;
            Object.entries(tally.candidateCounts || {}).forEach(([cName, count]) => {
              aggregatedMuniTally[muniName].candidateCounts[cName] =
                (aggregatedMuniTally[muniName].candidateCounts[cName] || 0) + (typeof count === "number" ? count : 0);
            });
          }
        });
      }
    });

    // 2. Compute state-level weighted results across target polls for this role
    const weightedStateResults: Record<string, number> = {};
    let totalStateSample = 0;

    targetPolls.forEach((p) => {
      const weight = p.sampleSize || 1000;
      totalStateSample += weight;
      const roleRes = p.roleResults?.[selectedRole] || (selectedRole === "Governador" ? p.results : {}) || {};
      officialCandidatesForRole.forEach((c) => {
        const pct = roleRes[c.name] || 0;
        weightedStateResults[c.name] = (weightedStateResults[c.name] || 0) + pct * weight;
      });
    });

    if (totalStateSample > 0) {
      officialCandidatesForRole.forEach((c) => {
        weightedStateResults[c.name] = parseFloat(((weightedStateResults[c.name] || 0) / totalStateSample).toFixed(1));
      });
    }

    // 3. Municipalities data calculation
    const municipalitiesWithVotes = SERGIPE_MUNICIPALITIES.map((m) => {
      let votesShare: { [c: string]: number } = {};
      const muniTally = aggregatedMuniTally[m.name];

      if (muniTally && muniTally.validVotes > 0) {
        // Direct microdata answers from all ingested bases
        officialCandidatesForRole.forEach((c) => {
          const count = muniTally.candidateCounts[c.name] || 0;
          votesShare[c.name] = parseFloat(((count / muniTally.validVotes) * 100).toFixed(1));
        });
      } else {
        // Regional or State multi-poll weighted fallback
        const territoryFound = territorialAnalysis.find((t) => t.name === m.territory);
        if (territoryFound && Object.keys(territoryFound.results).length > 0 && selectedRole === "Governador") {
          votesShare = { ...territoryFound.results };
        } else {
          officialCandidatesForRole.forEach((c) => {
            votesShare[c.name] = weightedStateResults[c.name] || 0;
          });
        }
      }

      // Calculate absolute estimated votes for each candidate in this municipality
      const absoluteVotes: { [c: string]: number } = {};
      Object.entries(votesShare).forEach(([candName, pct]) => {
        absoluteVotes[candName] = Math.round(m.voters * (pct / 100));
      });

      // Determine local leader for this role
      let leaderName: string | null = null;
      let leaderNumber: string | null = null;
      let leaderPct = 0;

      const sorted = officialCandidatesForRole
        .map((c) => ({
          ...c,
          pct: votesShare[c.name] || 0
        }))
        .sort((a, b) => b.pct - a.pct);

      if (sorted[0] && sorted[0].pct > 0) {
        leaderName = sorted[0].name;
        leaderNumber = sorted[0].number;
        leaderPct = sorted[0].pct;
      }

      // Selected candidate's local percentage
      const selectedCandidatePct = selectedOfficialCandidate
        ? votesShare[selectedOfficialCandidate.name] || 0
        : 0;

      return {
        ...m,
        votesShare,
        absoluteVotes,
        leaderName,
        leaderNumber,
        leaderPct,
        selectedCandidatePct
      };
    });

    // 4. Regional (Territory) calculations
    const territoriesMap: { [name: string]: { totalVoters: number; candidateVotes: { [c: string]: number } } } = {};
    municipalitiesWithVotes.forEach((m) => {
      const tName = m.territory;
      if (!territoriesMap[tName]) {
        territoriesMap[tName] = {
          totalVoters: 0,
          candidateVotes: {}
        };
      }
      territoriesMap[tName].totalVoters += m.voters;
      Object.entries(m.absoluteVotes).forEach(([c, votes]) => {
        territoriesMap[tName].candidateVotes[c] = (territoriesMap[tName].candidateVotes[c] || 0) + votes;
      });
    });

    const territoriesVotesShare: { [tName: string]: { [c: string]: number } } = {};
    Object.entries(territoriesMap).forEach(([tName, data]) => {
      territoriesVotesShare[tName] = {};
      if (data.totalVoters > 0) {
        officialCandidatesForRole.forEach((c) => {
          const votes = data.candidateVotes[c.name] || 0;
          territoriesVotesShare[tName][c.name] = parseFloat(((votes / data.totalVoters) * 100).toFixed(1));
        });
      }
    });

    // 5. State calculation
    const stateVotesShare: { [c: string]: number } = {};
    let totalStateVoters = 0;
    const stateCandidateVotes: { [c: string]: number } = {};

    municipalitiesWithVotes.forEach((m) => {
      totalStateVoters += m.voters;
      Object.entries(m.absoluteVotes).forEach(([c, votes]) => {
        stateCandidateVotes[c] = (stateCandidateVotes[c] || 0) + votes;
      });
    });

    if (totalStateVoters > 0) {
      officialCandidatesForRole.forEach((c) => {
        const votes = stateCandidateVotes[c.name] || 0;
        stateVotesShare[c.name] = parseFloat(((votes / totalStateVoters) * 100).toFixed(1));
      });
    }

    return {
      hasData: true,
      municipalities: municipalitiesWithVotes,
      territories: territoriesVotesShare,
      state: stateVotesShare,
      totalStateVoters
    };
  }, [
    hasPollsData,
    selectedBaseId,
    globalContext?.polls,
    globalContext?.uploadedDatasets,
    globalContext?.territorialAnalysis,
    selectedRole,
    officialCandidatesForRole,
    selectedOfficialCandidate
  ]);

  // Selected municipality record
  const selectedMunicipality = useMemo(() => {
    return (
      fullDataset.municipalities.find((m) => m.name === selectedMunicipalityName) ||
      fullDataset.municipalities[0]
    );
  }, [fullDataset, selectedMunicipalityName]);

  // Handle Search Input Autocomplete for municipalities
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const filtered = SERGIPE_MUNICIPALITIES.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, []);

  const selectAndFocusMunicipality = useCallback((mName: string) => {
    setSelectedMunicipalityName(mName);
    setSearchQuery(mName);
    setSearchResults([]);
    setActiveSideTab("municipio");

    const coord = MUNICIPALITY_GEOLOCATIONS[mName];
    if (coord && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo(coord, 11, {
        animate: true,
        duration: 1.5
      });
    }
  }, []);

  // Export 75 Municipalities CSV Report
  const handleExportCSV = useCallback(() => {
    if (!fullDataset.hasData) return;

    const headers = [
      "Município",
      "Território",
      "Eleitorado TSE",
      "Cargo",
      "Líder Local",
      "Líder %",
      ...officialCandidatesForRole.map(c => `${c.name} (%)`),
      ...officialCandidatesForRole.map(c => `${c.name} (Votos Estimados)`)
    ];

    const rows = fullDataset.municipalities.map(m => {
      const rowData = [
        `"${m.name}"`,
        `"${m.territory}"`,
        m.voters,
        `"${selectedRole}"`,
        `"${m.leaderName || "N/D"}"`,
        m.leaderPct.toFixed(1),
        ...officialCandidatesForRole.map(c => (m.votesShare[c.name] || 0).toFixed(1)),
        ...officialCandidatesForRole.map(c => m.absoluteVotes[c.name] || 0)
      ];
      return rowData.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `mapa_eleitoral_sergipe_75mun_${selectedRole.toLowerCase().replace(/\s+/g, "_")}_${selectedBaseId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fullDataset, officialCandidatesForRole, selectedRole, selectedBaseId]);

  // Initialize Leaflet Map Instance with OpenStreetMap Base & IBGE GeoJSON Mesh
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Mantém o mapa base limpo
    const map = L.map(mapContainerRef.current, {
      center: [-10.57, -37.38],
      zoom: 8,
      zoomControl: true,
      minZoom: 7,
      maxZoom: 16
    });

    leafletMapInstanceRef.current = map;

    // Mapeamento de código IBGE -> Nome Canônico do Município
    const ibgeToName: { [key: string]: string } = {};
    SERGIPE_75_MUNICIPIOS.forEach((m) => {
      ibgeToName[m.codigoIbge] = m.nome;
    });

    // 2. Carrega a malha de municípios diretamente da API do IBGE (Sergipe = 28)
    fetch("https://servicodados.ibge.gov.br/api/v3/malhas/estados/28?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio")
      .then((res) => res.json())
      .then((data) => {
        if (!leafletMapInstanceRef.current) return;

        let geoJsonLayer: L.GeoJSON;
        geoJsonLayer = L.geoJSON(data, {
          style: {
            color: "#555",       // Cor da linha de divisão municipal
            weight: 1,           // Espessura da linha
            fillColor: "#fff",
            fillOpacity: 0.1     // Quase transparente para não cobrir o fundo
          },
          onEachFeature: (feature, layer) => {
            const muniName =
              feature.properties?.name ||
              feature.properties?.nome ||
              (feature.properties?.codarea && ibgeToName[feature.properties.codarea]) ||
              "";

            if (muniName) {
              layer.bindTooltip(muniName, {
                sticky: true,
                className: "font-sans font-semibold text-xs text-slate-900 bg-white/95 px-2.5 py-1 rounded shadow border border-slate-200"
              });
            }

            layer.on({
              click: () => {
                if (muniName) {
                  selectAndFocusMunicipality(muniName);
                }
              },
              mouseover: (e: any) => {
                e.target.setStyle({
                  weight: 2,
                  color: "#1E40AF",
                  fillOpacity: 0.25
                });
              },
              mouseout: (e: any) => {
                geoJsonLayer.resetStyle(e.target);
              }
            });
          }
        }).addTo(map);

        geoJsonLayerRef.current = geoJsonLayer;
      })
      .catch((err) => {
        console.error("[SEIE Cartografia] Erro ao carregar malha do IBGE:", err);
      });

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Auto-invalidate map size on container resize or tab switch
    const resizeObserver = new ResizeObserver(() => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      leafletMapInstanceRef.current = null;
      geoJsonLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [selectAndFocusMunicipality]);

  // Update Map Tile Layer — OpenStreetMap
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    if (!map) return;

    // Remove qualquer camada de tiles existente
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // OpenStreetMap — sem dependência de API Key do CARTO
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ["a", "b", "c"]
      }
    ).addTo(map);

    // Garante o correto dimensionamento dos tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Redraw Circle Markers when data, polls, cargo, candidate selection, or base selection changes
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // Recreate circles for all 75 canonical municipalities
    fullDataset.municipalities.forEach((m) => {
      const coord = MUNICIPALITY_GEOLOCATIONS[m.name];
      if (!coord) {
        // REGRA INVIOLÁVEL: Nenhum centróide municipal pode usar Aracaju ou qualquer outro como fallback
        console.warn(`[SEIE Cartografia] Centróide geográfico NÃO ENCONTRADO para "${m.name}". Marcado explicitamente como NOT_FOUND e omitido do mapa.`);
        return;
      }

      const isSelected = m.name === selectedMunicipalityName;
      let radius = Math.max(6, Math.min(Math.sqrt(m.voters) / 12, 34));

      let markerColor = "#94A3B8"; // Neutral Slate
      let fillOpacity = isSelected ? 0.85 : 0.4;
      let strokeColor = isSelected ? "#1E40AF" : "#CBD5E1";
      let weight = isSelected ? 3.5 : 1;

      if (fullDataset.hasData) {
        if (selectedCandidateNumber === "ALL") {
          // Mode 1: Role Leader Heatmap
          if (m.leaderName) {
            const leaderCandidate = officialCandidatesForRole.find((c) => c.name === m.leaderName);
            markerColor = getOfficialCandidateColor(m.leaderName, leaderCandidate?.partyNumber);
            fillOpacity = isSelected ? 0.95 : 0.72;
            strokeColor = isSelected ? "#FFFFFF" : markerColor;
            weight = isSelected ? 3.5 : 1;
          }
        } else if (selectedOfficialCandidate) {
          // Mode 2: Specific Official Candidate Concentration Map
          const candColor = getOfficialCandidateColor(
            selectedOfficialCandidate.name,
            selectedOfficialCandidate.partyNumber
          );
          markerColor = candColor;
          const candPct = m.selectedCandidatePct || 0;

          // Scale radius and opacity by candidate local vote share
          const intensityScale = Math.max(0.15, Math.min(candPct / 40, 1));
          radius = Math.max(7, Math.min(Math.sqrt(m.voters) / 12 * (0.8 + intensityScale * 0.6), 36));
          fillOpacity = isSelected ? 0.95 : 0.25 + intensityScale * 0.65;
          strokeColor = isSelected ? "#FFFFFF" : (candPct > 5 ? markerColor : "#94A3B8");
          weight = isSelected ? 3.5 : (candPct > 10 ? 1.5 : 1);
        }
      }

      // Create Leaflet Circle Marker
      const marker = L.circleMarker(coord, {
        radius: radius,
        fillColor: markerColor,
        color: strokeColor,
        weight: weight,
        fillOpacity: fillOpacity,
        className: "transition-all duration-200 cursor-pointer shadow-md"
      });

      // Bind Tooltip
      let tooltipContent = "";

      if (!fullDataset.hasData) {
        tooltipContent = `
          <div class="p-2.5 font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-xl min-w-[200px] border border-slate-200 dark:border-slate-700">
            <p class="font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-1 mb-1 text-slate-900 dark:text-white uppercase tracking-tight">
              📍 ${m.name}
            </p>
            <p class="text-[9px] font-mono text-slate-500 mb-2">${m.territory}</p>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 leading-snug">
              ℹ️ Nenhuma base carregada. Aguardando ingestão de microdados no módulo Diagnóstico.
            </div>
            <div class="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1.5 flex justify-between text-[8px] font-mono text-slate-400">
              <span>Eleitorado TSE:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">${m.voters.toLocaleString()}</span>
            </div>
          </div>
        `;
      } else if (selectedCandidateNumber !== "ALL" && selectedOfficialCandidate) {
        // Candidate-specific detailed tooltip
        const candColor = getOfficialCandidateColor(
          selectedOfficialCandidate.name,
          selectedOfficialCandidate.partyNumber
        );
        const candPct = m.selectedCandidatePct || 0;
        const estVotes = Math.round(m.voters * (candPct / 100));

        tooltipContent = `
          <div class="p-3 font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-xl min-w-[220px] border border-slate-200 dark:border-slate-700">
            <p class="font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-1 mb-1 text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-between">
              <span>📍 ${m.name}</span>
              <span class="text-[9px] font-mono text-slate-400">#${selectedOfficialCandidate.number}</span>
            </p>
            <p class="text-[9px] font-mono text-slate-500 mb-2">${m.territory}</p>
            <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 space-y-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="background-color: ${candColor}"></span>
                <span class="font-bold text-xs text-slate-900 dark:text-white truncate">${selectedOfficialCandidate.name}</span>
              </div>
              <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <span class="text-slate-500 text-[10px]">Intenção de Voto:</span>
                <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">${candPct.toFixed(1)}%</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-500">
                <span>Votos Estimados:</span>
                <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">~${estVotes.toLocaleString()}</span>
              </div>
            </div>
            <div class="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1 flex justify-between text-[8px] font-mono text-slate-400">
              <span>Eleitorado: ${m.voters.toLocaleString()}</span>
              <span>Base: ${activeBaseSummary.isConsolidated ? "Consolidada" : "Individual"}</span>
            </div>
          </div>
        `;
      } else {
        // General role leader tooltip
        const sortedFull = (Object.entries(m.votesShare) as Array<[string, number]>)
          .filter(([_, pct]) => pct > 0)
          .sort((a, b) => b[1] - a[1]);

        tooltipContent = `
          <div class="p-2.5 font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-xl min-w-[220px] border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
              <p class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-tight">
                📍 ${m.name}
              </p>
              <span class="text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                ${selectedRole}
              </span>
            </div>
            <p class="text-[9px] font-mono text-slate-500 mb-1.5">${m.territory}</p>
            <div class="space-y-1">
              ${sortedFull.slice(0, 4).map(([cand, pct], idx) => {
                const candObj = officialCandidatesForRole.find((c) => c.name === cand);
                const color = getOfficialCandidateColor(cand, candObj?.partyNumber);
                return `
                  <div class="flex items-center justify-between text-[10px]">
                    <div class="flex items-center gap-1.5 truncate max-w-[145px]">
                      <span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${color}"></span>
                      <span class="${idx === 0 ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"} truncate">${cand}</span>
                    </div>
                    <span class="font-mono ${idx === 0 ? "font-bold text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}">${pct.toFixed(1)}%</span>
                  </div>
                `;
              }).join("")}
            </div>
            <div class="border-t border-slate-100 dark:border-slate-800 mt-2 pt-1 flex justify-between text-[8px] font-mono text-slate-400">
              <span>Eleitorado: ${m.voters.toLocaleString()}</span>
              <span>Líder: ${m.leaderName || "N/D"}</span>
            </div>
          </div>
        `;
      }

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        opacity: 0.98,
        className: "bg-transparent border-0 shadow-none"
      });

      // Interactive Click
      marker.on("click", () => {
        setSelectedMunicipalityName(m.name);
        setActiveSideTab("municipio");
      });

      marker.addTo(markersGroup);
    });
  }, [
    fullDataset,
    selectedMunicipalityName,
    selectedRole,
    selectedCandidateNumber,
    selectedOfficialCandidate,
    officialCandidatesForRole,
    activeBaseSummary
  ]);

  // Recalculate candidate statistics comparison array for official 2026 candidates
  const candidatesComparison = useMemo(() => {
    const mShare = selectedMunicipality.votesShare || {};
    const rShare = fullDataset.territories[selectedMunicipality.territory] || {};
    const sShare = fullDataset.state || {};

    return officialCandidatesForRole
      .map((cand) => {
        const name = cand.name;
        const mPct = fullDataset.hasData ? (mShare[name] || 0) : 0;
        const rPct = fullDataset.hasData ? (rShare[name] || 0) : 0;
        const sPct = fullDataset.hasData ? (sShare[name] || 0) : 0;

        return {
          ...cand,
          mPct,
          rPct,
          sPct,
          diffRegion: parseFloat((mPct - rPct).toFixed(1)),
          diffState: parseFloat((mPct - sPct).toFixed(1))
        };
      })
      .sort((a, b) => b.mPct - a.mPct);
  }, [fullDataset, selectedMunicipality, officialCandidatesForRole]);

  return (
    <div className="space-y-6 animate-fade-in" id="mapa-eleitoral-container">
      
      {/* Page Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                Mapa Eleitoral Georreferenciado (75 Municípios)
              </h1>
              {hasPollsData && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  {activeBaseSummary.isConsolidated ? "Todas as Bases Salvas" : "Pesquisa Específica"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Estratificação espacial e análise de intenções de voto para os 75 municípios utilizando toda a base cadastrada no Diagnóstico.
            </p>
          </div>
        </div>

        {/* Dynamic Provider & Export Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={!fullDataset.hasData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
            title="Exportar dados dos 75 municípios em CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Exportar CSV (75 Mun)</span>
          </button>

        </div>
      </div>

      {/* Base Metrics Dashboard Card (Diagnóstico Integration) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-2xl border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Origem dos Dados • Diagnóstico de Pesquisas
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {activeBaseSummary.totalPolls} {activeBaseSummary.totalPolls === 1 ? "pesquisa" : "pesquisas na base"}
                </span>
              </div>
              <h3 className="text-sm font-bold font-sans text-slate-100 mt-0.5">
                {activeBaseSummary.title}
              </h3>
            </div>
          </div>

          {/* Base Selector Dropdown */}
          <div className="w-full lg:w-auto min-w-[300px]">
            <div className="relative">
              <select
                id="select-base-diagnostico"
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="w-full bg-slate-800/90 text-xs text-slate-100 border border-slate-700 rounded-2xl px-3.5 py-2.5 pr-8 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer font-sans"
              >
                <option value="ALL" className="bg-slate-900 text-white font-bold">
                  🌐 Consolidado Geral (Todas as {savedPollsList.length} Pesquisas Salvas no Diagnóstico)
                </option>
                {savedPollsList.length > 0 && (
                  <optgroup label="Pesquisas Individuais Salvas no Diagnóstico" className="bg-slate-900 text-slate-300">
                    {savedPollsList.map((p, idx) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                        📊 #{idx + 1} {p.institute || "CTAS"} • {getPollDateBR(p)} (N={(p.sampleSize || 1000).toLocaleString()})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Base Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Amostra Acumulada</span>
            <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
              {activeBaseSummary.totalInterviews.toLocaleString()} entrevistas
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Margem / Confiança</span>
            <span className="text-sm font-bold font-mono text-blue-400 mt-0.5 block">
              ±{activeBaseSummary.marginOfError}% ({activeBaseSummary.confidenceLevel}%)
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Período de Coleta</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
              {activeBaseSummary.periodText}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Institutos Ingeridos</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
              {activeBaseSummary.institutesText}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Cargo Filter & Official Candidate Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Cargo Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400 px-2">Cargo:</span>
          {ROLES_LIST.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                id={`btn-filter-role-${role.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleRoleChange(role)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#1E40AF] text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900"
                }`}
              >
                {role}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isSelected
                    ? "bg-blue-900/50 text-blue-200"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {CANDIDATOS_OFICIAIS_2026.filter((c) => c.role === role).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Candidate Specific Dropdown / Heatmap Filter */}
        <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
          <div className="relative w-full">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs focus-within:border-blue-600 transition-all">
              <Filter className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />
              <select
                id="select-official-candidate-filter"
                value={selectedCandidateNumber}
                onChange={(e) => setSelectedCandidateNumber(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  🗺️ Visão Geral: Líderes Municipais ({selectedRole})
                </option>
                <optgroup label={`Candidatos Oficiais 2026 - ${selectedRole}`} className="dark:bg-slate-900">
                  {officialCandidatesForRole.map((c) => (
                    <option key={`${c.number}-${c.name}`} value={c.number} className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      #{c.number} • {c.name} ({c.partyNumber || c.coalition})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {selectedCandidateNumber !== "ALL" && (
            <button
              onClick={() => setSelectedCandidateNumber("ALL")}
              className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 bg-blue-50 dark:bg-blue-950 px-2.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              Ver Todos
            </button>
          )}
        </div>

      </div>

      {/* Main Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leaflet Interactive Map Card (Left column) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 flex flex-col h-[620px] relative overflow-hidden">
          
          {/* Internal search overlay */}
          <div className="absolute top-6 left-6 right-6 z-[1000] max-w-sm">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2 shadow-md focus-within:border-blue-600 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                id="search-municipality-input"
                type="text"
                placeholder="Pesquisar entre os 75 municípios..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full text-xs outline-none text-slate-800 dark:text-slate-100 bg-transparent"
              />
            </div>

            {/* Auto-complete items dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-[2000]">
                {searchResults.map((m) => (
                  <button
                    key={m.name}
                    id={`btn-select-muni-${m.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => selectAndFocusMunicipality(m.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex justify-between items-center transition-colors"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                    <span className="font-mono text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900 font-bold">
                      {m.territory}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leaflet DOM viewport mounting target */}
          <div
            ref={mapContainerRef}
            id="leaflet-sergipe-map-viewport"
            className="w-full h-full rounded-2xl overflow-hidden z-10 border border-slate-100 dark:border-slate-800 shadow-inner"
            style={{ minHeight: "550px" }}
          />

          {/* Legend instructions absolute label */}
          <div className="absolute bottom-6 left-6 right-6 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-md pointer-events-none flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />
              <p className="text-slate-600 dark:text-slate-300 font-medium font-sans">
                {hasPollsData
                  ? selectedOfficialCandidate
                    ? `🎯 Exibindo concentração de votos de ${selectedOfficialCandidate.name} (#${selectedOfficialCandidate.number}) nos 75 municípios.`
                    : `💡 Exibindo líder por município para ${selectedRole}. Clique no município para detalhar.`
                  : "💡 Modo Neutro: mapa geográfico exibindo os 75 municípios de Sergipe."}
              </p>
            </div>
            <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase shrink-0">
              75 Mun. • {selectedRole}
            </div>
          </div>

        </div>

        {/* Geo-Analytics Comparative Panel (Right column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Tab switch inside side panel: Raio-X Município vs Territórios vs Metodologia */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveSideTab("municipio")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeSideTab === "municipio"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Raio-X: {selectedMunicipality.name}
              </button>
              <button
                onClick={() => setActiveSideTab("territorios")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeSideTab === "territorios"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                8 Territórios
              </button>
              <button
                onClick={() => setActiveSideTab("metodologia")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeSideTab === "metodologia"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Base Diagnóstico
              </button>
            </div>

            {activeSideTab === "municipio" && (
              <div className="space-y-4 animate-fade-in">
                {/* Selected Municipality Identification Header */}
                <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                        {selectedMunicipality.name}
                      </h2>
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded-md">
                        {selectedMunicipality.territory}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
                      {hasPollsData
                        ? `Cruzamento Oficial 2026 • ${selectedRole} • Município vs Região vs Estado`
                        : "Aguardando Ingestão de Dados"}
                    </p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-mono text-slate-400 uppercase font-bold">Eleitorado Local</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Users className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {selectedMunicipality.voters.toLocaleString()} eleitores
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-mono text-slate-400 uppercase font-bold">Líder do Cargo Local</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {hasPollsData && selectedMunicipality.leaderName
                          ? `${selectedMunicipality.leaderName} (${selectedMunicipality.leaderPct.toFixed(1)}%)`
                          : "Sem dados (0)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidates Comparison List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold px-1 uppercase tracking-wider">
                    <span>Candidatos Oficiais 2026 ({selectedRole})</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {hasPollsData ? `${candidatesComparison.length} Cadastrados` : "Sem Base"}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {candidatesComparison.map((cand) => {
                      const color = getOfficialCandidateColor(cand.name, cand.partyNumber);
                      const isCandActive = selectedCandidateNumber === cand.number;
                      
                      return (
                        <div
                          key={`${cand.number}-${cand.name}`}
                          onClick={() => setSelectedCandidateNumber(isCandActive ? "ALL" : cand.number)}
                          className={`border rounded-2xl p-2.5 transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isCandActive
                              ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-sm"
                              : "bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          {/* Name & Spectrum header */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 truncate max-w-[200px]">
                              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{cand.name}</span>
                              <span className="text-[9px] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shrink-0">
                                #{cand.number}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                                {hasPollsData ? `${cand.mPct.toFixed(1)}%` : "0.0%"}
                              </span>
                              {isCandActive && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          </div>

                          {/* Comparisons line */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-dashed border-slate-200/80 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Região ({hasPollsData ? `${cand.rPct.toFixed(1)}%` : "0%"}):</span>
                              <span
                                className={`font-mono font-bold flex items-center shrink-0 ${
                                  cand.diffRegion > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : cand.diffRegion < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {cand.diffRegion > 0 ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : cand.diffRegion < 0 ? (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                ) : null}
                                {cand.diffRegion > 0 ? `+${cand.diffRegion}%` : `${cand.diffRegion}%`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Estado ({hasPollsData ? `${cand.sPct.toFixed(1)}%` : "0%"}):</span>
                              <span
                                className={`font-mono font-bold flex items-center shrink-0 ${
                                  cand.diffState > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : cand.diffState < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-slate-400"
                                }`}
                              >
                                {cand.diffState > 0 ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : cand.diffState < 0 ? (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                ) : null}
                                {cand.diffState > 0 ? `+${cand.diffState}%` : `${cand.diffState}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dossier Insight */}
                <div className="bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 p-3.5 space-y-1">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-[#1E40AF] dark:text-blue-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Dossiê Estratigráfico ({activeBaseSummary.isConsolidated ? "Base Consolidada" : "Pesquisa Individual"})
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {hasPollsData ? (
                      <>
                        Em <strong>{selectedMunicipality.name}</strong> ({selectedMunicipality.territory}), liderança de <strong>{candidatesComparison[0]?.name || "Candidato"}</strong> com {candidatesComparison[0]?.mPct.toFixed(1) || 0}% das intenções válidas na base selecionada.
                      </>
                    ) : (
                      "Nenhuma base carregada. Cadastre pesquisas no módulo Diagnóstico para visualizar os dados."
                    )}
                  </p>
                </div>
              </div>
            )}

            {activeSideTab === "territorios" && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold px-1 uppercase tracking-wider">
                  <span>8 Territórios de Sergipe</span>
                  <span className="text-blue-600 dark:text-blue-400">Total 75 Municípios</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {SERGIPE_TERRITORIOS.map((tName) => {
                    const munisInTerritory = fullDataset.municipalities.filter(m => m.territory === tName);
                    const totalVoters = munisInTerritory.reduce((acc, m) => acc + m.voters, 0);
                    const tShare = fullDataset.territories[tName] || {};
                    
                    // Find top candidate in this territory
                    const sortedCand = officialCandidatesForRole
                      .map(c => ({ name: c.name, pct: tShare[c.name] || 0, number: c.number }))
                      .sort((a, b) => b.pct - a.pct);

                    const topCand = sortedCand[0];

                    return (
                      <div
                        key={tName}
                        className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{tName}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {munisInTerritory.length} mun. • {totalVoters.toLocaleString()} eleit.
                          </span>
                        </div>

                        {topCand && topCand.pct > 0 && (
                          <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 text-[10px]">Líder Regional:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {topCand.name} ({topCand.pct.toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSideTab === "metodologia" && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Base Ativa no Mapa</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{activeBaseSummary.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Pesquisas Integradas</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{activeBaseSummary.totalPolls}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Entrevistas Válidas</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeBaseSummary.totalInterviews.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Margem Ponderada</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">±{activeBaseSummary.marginOfError}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Confiança</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{activeBaseSummary.confidenceLevel}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Estatístico Responsável</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{activeBaseSummary.statisticianText}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Institutos</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{activeBaseSummary.institutesText}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-bold font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 w-full sm:w-auto text-center sm:text-left">
              Base Oficial 2026 • CONRE 10801 • CTAS Inteligência
            </div>
            <span className="text-[9px] text-slate-400">75 Municípios de Sergipe</span>
          </div>

        </div>

      </div>
    </div>
  );
}
