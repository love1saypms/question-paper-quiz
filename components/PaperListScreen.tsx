import type { QuestionPaper } from "@/lib/quiz/types";

type Props = {
  papers: QuestionPaper[];
  onSelect: (paper: QuestionPaper) => void;
};

export default function PaperListScreen({ papers, onSelect }: Props) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">문제풀이</h1>
        <p className="text-slate-600">
          풀고 싶은 문제지를 골라주세요. 모든 문제를 푼 뒤에 점수와 해설을 볼 수 있습니다.
        </p>
      </header>

      {papers.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">아직 준비된 문제지가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {papers.map((paper) => (
            <li key={paper.id}>
              <button
                type="button"
                onClick={() => onSelect(paper)}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-lg font-semibold shadow-sm hover:border-blue-400 hover:bg-blue-50"
              >
                <span>{paper.title}</span>
                <span aria-hidden="true" className="text-blue-600">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
