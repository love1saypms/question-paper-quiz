import type { Answer, Question } from "@/lib/quiz/types";

type Props = {
  questions: Question[];
  answers: Answer[];
  current: number;
  onChoose: (choice: number) => void;
  onMove: (index: number) => void;
  onGrade: () => void;
};

// 풀이 중에는 정답 여부·점수·해설을 보여주지 않습니다.
export default function QuestionScreen({ questions, answers, current, onChoose, onMove, onGrade }: Props) {
  const question = questions[current];
  const chosen = answers[current];
  const total = questions.length;
  const isLast = current === total - 1;
  const unanswered = answers.flatMap((a, i) => (a === null ? [i + 1] : []));
  const answeredCount = total - unanswered.length;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {current + 1} / {total}
          </span>
          <span>답한 문항 {answeredCount}개</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} />
        </div>
      </div>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="sr-only">{current + 1}번 문제</legend>
        <p className="mb-5 text-lg font-semibold leading-relaxed sm:text-xl">
          <span className="mr-2 text-blue-700">{current + 1}.</span>
          {question.question}
        </p>
        <div className="space-y-3">
          {question.options.map((option, k) => {
            const number = k + 1;
            const selected = chosen === number;
            return (
              <label
                key={k}
                className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 ${
                  selected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${current}`}
                  value={number}
                  checked={selected}
                  onChange={() => onChoose(number)}
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                />
                <span>
                  <span className="mr-1 font-semibold">{number}.</span>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onMove(current - 1)}
          disabled={current === 0}
          className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          이전
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onGrade}
            disabled={unanswered.length > 0}
            className="min-h-12 flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none"
          >
            채점하기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onMove(current + 1)}
            className="min-h-12 flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:flex-none"
          >
            다음
          </button>
        )}
      </div>

      {isLast && unanswered.length > 0 && (
        <p className="rounded-xl bg-amber-50 p-4 text-amber-900">
          모든 문항에 답해야 채점할 수 있습니다. 아직 답하지 않은 문항: {unanswered.map((n) => `${n}번`).join(", ")}
        </p>
      )}
    </section>
  );
}
