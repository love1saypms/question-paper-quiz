"use client";

import { useState } from "react";
import type { Answer, Question } from "@/lib/quiz/types";
import { gradeQuiz } from "@/lib/quiz/score";
import UploadScreen from "./UploadScreen";
import ConfirmScreen from "./ConfirmScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";

type Step = "upload" | "confirm" | "quiz" | "result";

// 화면 단계와 고른 답은 이 브라우저 화면 안에서만 기억합니다. 새로고침하면 처음부터 시작합니다.
export default function QuizApp() {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState(0);

  function goTo(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function startQuiz() {
    setAnswers(questions.map(() => null));
    setCurrent(0);
    goTo("quiz");
  }

  if (step === "upload") {
    return (
      <UploadScreen
        onLoaded={(name, loaded) => {
          setFileName(name);
          setQuestions(loaded);
          goTo("confirm");
        }}
      />
    );
  }

  if (step === "confirm") {
    return <ConfirmScreen fileName={fileName} count={questions.length} onStart={startQuiz} />;
  }

  if (step === "quiz") {
    return (
      <QuestionScreen
        questions={questions}
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
      result={gradeQuiz(questions, answers)}
      onRetry={startQuiz}
      onNewFile={() => {
        setQuestions([]);
        setAnswers([]);
        goTo("upload");
      }}
    />
  );
}
