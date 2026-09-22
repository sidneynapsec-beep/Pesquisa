export type ProvenanceType = "OFFICIAL" | "ESTIMATED" | "PROJECTION" | "SIMULATION" | "DEMO" | "NOT_FOUND";

export interface DataProvenance {
  source: string;
  type: ProvenanceType;
  referenceDate?: string;
  loadedAt?: string;
  datasetId?: string;
  notes?: string;
}

/**
 * Funções auxiliares para padronização de proveniência de dados
 */
export function createOfficialProvenance(source: string, notes?: string, datasetId?: string): DataProvenance {
  return {
    source,
    type: "OFFICIAL",
    loadedAt: new Date().toISOString(),
    datasetId,
    notes
  };
}

export function createEstimatedProvenance(source: string, notes?: string, referenceDate?: string): DataProvenance {
  return {
    source,
    type: "ESTIMATED",
    referenceDate,
    notes
  };
}

export function createProjectionProvenance(source: string, notes?: string, referenceDate?: string): DataProvenance {
  return {
    source,
    type: "PROJECTION",
    referenceDate,
    notes
  };
}

export function createSimulationProvenance(source: string, notes?: string): DataProvenance {
  return {
    source,
    type: "SIMULATION",
    notes
  };
}

export function createNotFoundProvenance(source: string = "NOT_FOUND", notes: string = "Dado não disponível na base oficial carregada"): DataProvenance {
  return {
    source,
    type: "NOT_FOUND",
    notes
  };
}
