import type { Answer, Question } from "./types";

export type QuestionResult = {
  question: Question;
  chosen: Answer;
  isCorrect: boolean;
};

export type QuizResult = {
  correctCount: number;
  total: number;
  score: number;
  results: QuestionResult[];
};

export function gradeQuiz(questions: Question[], answers: Answer[]): QuizResult {
  const results = questions.map((question, i) => {
    const chosen = answers[i] ?? null;
    return { question, chosen, isCorrect: chosen === question.correctAnswer };
  });
  const correctCount = results.filter((r) => r.isCorrect).length;
  return {
    correctCount,
    total: questions.length,
    score: calculateScore(correctCount, questions.length),
    results,
  };
}

// 정답 수 ÷ 전체 문항 수 × 100을 소수 첫째 자리까지 반올림합니다.
// 소수 계산 오차를 피하려고 1000을 먼저 곱한 뒤 나눕니다.
export function calculateScore(correctCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correctCount * 1000) / total) / 10;
}
