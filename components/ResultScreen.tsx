import type { QuizResult } from "@/lib/quiz/score";
import type { Answer, Question } from "@/lib/quiz/types";

type Props = {
  title: string;
  result: QuizResult;
  onRetry: () => void;
  onBackToList: () => void;
};

function optionText(question: Question, choice: Answer) {
  if (choice === null) return "고르지 않음";
  return `${choice}번. ${question.options[choice - 1]}`;
}

export default function ResultScreen({ title, result, onRetry, onBackToList }: Props) {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">결과</h1>
        <p className="text-slate-600">{title}</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">총점</p>
        <p className="text-5xl font-bold text-blue-700">{result.score}점</p>
        <p className="mt-2 text-slate-600">
          {result.total}문항 중 {result.correctCount}문항을 맞혔습니다.
        </p>
      </div>

      <ol className="space-y-4">
        {result.results.map(({ question, chosen, isCorrect }, i) => (
          <li
            key={i}
            className={`rounded-2xl border-2 bg-white p-5 ${isCorrect ? "border-green-300" : "border-red-300"}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{i + 1}번</span>
              <span
                className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                  isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {isCorrect ? "○ 맞음" : "✕ 틀림"}
              </span>
            </div>
            <p className="font-medium leading-relaxed">{question.question}</p>
            <dl className="mt-3 space-y-1 text-sm sm:text-base">
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-500">내가 고른 답</dt>
                <dd className={isCorrect ? "" : "text-red-700"}>{optionText(question, chosen)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-500">정답</dt>
                <dd className="font-medium text-green-800">{optionText(question, question.correctAnswer)}</dd>
              </div>
            </dl>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed sm:text-base">
              <span className="font-semibold">해설 </span>
              {question.explanation}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-12 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          다시 풀기
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50"
        >
          문제지 목록으로
        </button>
      </div>
    </section>
  );
}
