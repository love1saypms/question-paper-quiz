"use client";

import { useState } from "react";
import type { Answer, QuestionPaper } from "@/lib/quiz/types";
import { gradeQuiz } from "@/lib/quiz/score";
import PaperListScreen from "./PaperListScreen";
import ConfirmScreen from "./ConfirmScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";

type Step = "list" | "confirm" | "quiz" | "result";

type Props = {
  papers: QuestionPaper[];
};

// 화면 단계와 고른 답은 이 브라우저 화면 안에서만 기억합니다. 새로고침하면 처음부터 시작합니다.
export default function QuizApp({ papers }: Props) {
  const [step, setStep] = useState<Step>("list");
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState(0);

  function goTo(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function backToList() {
    setPaper(null);
    setAnswers([]);
    goTo("list");
  }

  function startQuiz() {
    if (!paper) return;
    setAnswers(paper.questions.map(() => null));
    setCurrent(0);
    goTo("quiz");
  }

  if (step === "list" || !paper) {
    return (
      <PaperListScreen
        papers={papers}
        onSelect={(selected) => {
          setPaper(selected);
          goTo("confirm");
        }}
      />
    );
  }

  if (step === "confirm") {
    return (
      <ConfirmScreen title={paper.title} count={paper.questions.length} onStart={startQuiz} onBack={backToList} />
    );
  }

  if (step === "quiz") {
    return (
      <QuestionScreen
        questions={paper.questions}
        answers={answers}
        current={current}
        onChoose={(choice) => setAnswers((prev) => prev.map((a, i) => (i === current ? choice : a)))}
        onMove={(index) => {
          setCurrent(index);
          window.scrollTo({ top: 0 });
        }}
        onGrade={() => goTo("result")}
      />
    );
  }

  return (
    <ResultScreen
      title={paper.title}
      result={gradeQuiz(paper.questions, answers)}
      onRetry={startQuiz}
      onBackToList={backToList}
    />
  );
}
