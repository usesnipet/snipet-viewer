import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { KnowledgeBasePage } from "./pages/knowledge/knowledge-base-page";
import { KnowledgeSourcePage } from "./pages/knowledge/knowledge-source-page";
import { LLMPage } from "./pages/llm/llm-page";
import { RerankerPage } from "./pages/reranker/reranker-page";
import { EmbeddingPage } from "./pages/embeddings/embedding-page";
import { ObservabilityPage } from "./pages/observability/observability-page";
import { RootLayout } from "./components/layout/root";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/rerankers" replace />} />
          <Route path="/knowledge/base" element={<KnowledgeBasePage />} />
          <Route path="/knowledge/source" element={<KnowledgeSourcePage />} />
          <Route path="/llms" element={<LLMPage />} />
          <Route path="/rerankers" element={<RerankerPage />} />
          <Route path="/embeddings" element={<EmbeddingPage />} />
          {/* <Route path="/observability" element={<ObservabilityPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
