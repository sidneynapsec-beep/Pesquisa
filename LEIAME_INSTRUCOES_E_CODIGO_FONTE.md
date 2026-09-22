# SEIE - Sistema Especialista em Inteligência Eleitoral (Sergipe 2026)
## CTAS Consultoria e Pesquisa • Responsável Técnico: Sidney Barreto Batista (CONRE nº 10801)

Este pacote contém o **código-fonte completo e integral** do SEIE para a análise, auditoria, diagnóstico amostral e predição das Eleições 2026 no Estado de Sergipe.

---

## 🚀 Como Executar o Projeto no seu Computador (Passo a Passo)

### 1. Pré-requisitos
Você só precisa ter o **Node.js** instalado (versão 18 ou superior).
Se ainda não tiver o Node.js instalado, baixe gratuitamente em: https://nodejs.org/

### 2. Instalação das Dependências
Abra o terminal (ou Prompt de Comando / PowerShell) na pasta onde você descompactou os arquivos e execute:
```bash
npm install
```
Isso fará o download automático de todas as bibliotecas necessárias (React, Express, Tailwind CSS, Recharts, Leaflet, etc.).

### 3. Iniciar o Sistema no Modo de Desenvolvimento
No terminal, digite:
```bash
npm run dev
```
O sistema iniciará o servidor local e exibirá um link (geralmente `http://localhost:3000`).
Abra esse endereço no seu navegador (Google Chrome, Edge, Firefox, etc.) para utilizar o sistema completo!

### 4. (Opcional) Configurar a Inteligência Artificial Gemini
Caso deseje utilizar o agente analítico inteligente (Chat com IA):
1. Crie ou edite o arquivo `.env` na raiz do projeto.
2. Adicione sua chave de API gratuita do Google Gemini:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
   (Você pode obter sua chave em https://aistudio.google.com/app/apikey).

---

## 📁 Estrutura dos Arquivos do Sistema

- **`server.ts`**: Servidor de backend Express com rotas de API `/api/*`, persistência em disco de pesquisas e datasets, e integração segura com o Google Gemini.
- **`index.html`**: Ponto de entrada web com carregamento das fontes e estilos.
- **`package.json`**: Lista de dependências e comandos de execução.
- **`src/`**: Código-fonte do frontend React:
  - **`src/App.tsx`**: Componente principal com roteamento dos 12 módulos e persistência global.
  - **`src/components/`**:
    - `DashboardOverview.tsx`: Painel de controle executivo e KPIs de Sergipe.
    - `CalibracaoAmostral.tsx`: Calibração amostral oficial do TSE, auditoria de cotas e persistência (IndexedDB).
    - `DiagnosticoPesquisas.tsx`: Auditoria estatística PesqEle e curvas de margem de erro.
    - `CandidatosList.tsx`: Fichas completas de pré-candidatos oficiais (Governo, Senado, Deputados).
    - `GpsVotosBairros.tsx`: Inteligência geográfica de Aracaju, Socorro, Itabaiana, Lagarto e polos.
    - `SimuladorGuerra.tsx`: Matriz de transferência de votos e projeção de 2º turno.
    - `TrackingTendencias.tsx`: Monitoramento de séries históricas e curvas de intenção.
    - `CaminhoDaVitoria.tsx`: Metas territoriais e quocientes de vitória nos 75 municípios.
    - `RadarDigital.tsx`: Monitoramento de narrativas digitais e sentimento político.
    - `RelatorioEstrategico.tsx`: Geração de relatórios executivos para impressão/PDF.
    - `OutrosModulos.tsx`: Quociente eleitoral, auditoria de consistência e snapshots do sistema.
    - `SidneyAgent.tsx` & `ChatAI.tsx`: Consultor virtual de inteligência eleitoral.
    - `Header.tsx` & `Sidebar.tsx`: Navegação, alternância de papéis (Admin/Viewer) e temas.
  - **`src/data/`**:
    - `tseProfileStore.ts`: Base de dados do eleitorado de Sergipe 2026 (~1.650.412 eleitores) e motor de persistência.
    - `tseSergipeMunicipios.ts`: Tabela oficial dos 75 municípios e seus 8 territórios de planejamento.
    - `candidatosOficiais2026.ts`: Banco de pré-candidatos cadastrados para o pleito de 2026.
  - **`src/utils/`**:
    - `tseProfileProcessor.ts`: Decodificador inteligente de arquivos do TSE (Latin-1, UTF-8, LEIAME e Dados Abertos).

---

## ⚖️ Conformidade e Rigor Estatístico
Desenvolvido em total observância às normas da Justiça Eleitoral Brasileira e resoluções do TSE sobre pesquisas de opinião pública, com supervisão estatística do CONRE 10801.
