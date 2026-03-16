import { PageLayout } from "@/components/layout/page";
import { RerankerList } from "./_components/reranker-list";

export function RerankerPage() {
  return (
    <PageLayout
      title="Re-rankers"
      description="Configure models to refine search results and improve precision."
    >
      <RerankerList />
    </PageLayout>
  );
}
