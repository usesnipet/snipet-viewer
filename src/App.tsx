import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { KnowledgeBasePage } from "./pages/knowledge/knowledge-base-page";
import { KnowledgeSourcePage } from "./pages/knowledge/knowledge-source-page";
import { LLMPage } from "./pages/llm/llm-page";
import { RerankerPage } from "./pages/reranker/reranker-page";
import { EmbeddingPage } from "./pages/embeddings/embedding-page";
import { ObservabilityPage } from "./pages/observability/observability-page";
import { ThemeProvider } from "./components/theme-provider";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/knowledge/base" replace />} />
          <Route path="/knowledge/base" element={<KnowledgeBasePage />} />
          <Route path="/knowledge/source" element={<KnowledgeSourcePage />} />
          <Route path="/llms" element={<LLMPage />} />
          <Route path="/rerankers" element={<RerankerPage />} />
          <Route path="/embeddings" element={<EmbeddingPage />} />
          <Route path="/observability" element={<ObservabilityPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
