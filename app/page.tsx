import QuizApp from "@/components/QuizApp";
import { loadPapers } from "@/lib/papers.ts";

export default function Home() {
  const { papers } = loadPapers();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
      <QuizApp papers={papers} />
    </main>
  );
}
