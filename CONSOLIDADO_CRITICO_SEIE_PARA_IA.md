# ARQUIVO CONSOLIDADO PARA ANÁLISE DE IA: SEIE (SERGIPE 2026)
## Sistema Especialista de Inteligência Eleitoral • Responsável: CONRE 10801

Este documento reúne o núcleo de regras de negócio, modelos matemáticos, decodificadores do TSE e fluxos de dados do SEIE em formato consolidado para auditoria e análise imediata por modelos de IA (Claude, ChatGPT, Gemini, etc.).

---

### SUMÁRIO DOS ARQUIVOS CENTRAIS DO SEIE
1. `src/utils/tseProfileProcessor.ts`: Processamento e auditoria de arquivos brutos do TSE (Latin-1/UTF-8, colunas oficiais, soma de QT_ELEITORES_PERFIL).
2. `src/data/tseProfileStore.ts`: Estrutura de persistência permanente (IndexedDB + LocalStorage) e base oficial do eleitorado de Sergipe.
3. `src/components/CalibracaoAmostral.tsx`: Cálculo de desvio amostral, cotas sociodemográficas e calibração por município.
4. `src/components/DiagnosticoPesquisas.tsx`: Auditoria PesqEle, intervalo de confiança (95%), cálculo de margem de erro e controle de datas.
5. `src/components/SimuladorGuerra.tsx`: Matriz de transferência de votos de 2º turno e redistribuição proporcional.
6. `src/components/CaminhoDaVitoria.tsx`: Definição de metas territoriais, abstenções e quocientes eleitorais nos 75 municípios de Sergipe.
7. `server.ts`: Rotas de API, persistência em disco de pesquisas e datasets, e integração com IA.

---

### REGRAS CRÍTICAS DE NEGÓCIO E NORMAS ESTATÍSTICAS
- **Cálculo da População:** Sempre somar o campo `QT_ELEITORES_PERFIL` (ou `QT_ELEITORES`). NUNCA contar linhas de arquivo, pois cada linha do TSE representa um cruzamento com múltiplos eleitores.
- **Tolerância a Arquivos Oficiais:** Compatibilidade com variações de colunas (`DS_GRAU_INSTRUCAO` vs `DS_GRAU_ESCOLARIDADE`, `DS_COR_RACA` vs `DS_RACA_COR`).
- **Tratamento de Exceções:** Interpretação dos códigos `#NULO`, `-1`, `#NE`, `-3` como categorias válidas não informadas.
- **Margem de Erro (ME):** Formulação baseada em $ME = 1,96 \times \sqrt{\frac{p(1-p)}{n}}$ com correção finita se aplicável.
- **Votos Válidos:** Dedução obrigatória de respostas não estimuladas, brancos, nulos e indecisos para cálculo da porcentagem oficial de votos válidos.
