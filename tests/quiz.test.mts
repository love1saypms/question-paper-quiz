import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsePaperText, validatePaperData } from "../lib/quiz/validate.ts";
import { calculateScore, gradeQuiz } from "../lib/quiz/score.ts";
import { loadPapers } from "../lib/papers.ts";

const sampleText = readFileSync(new URL("../question-papers/sample-questions.json", import.meta.url), "utf8");

function validQuestion() {
  return {
    question: "문제",
    options: ["가", "나", "다", "라"],
    correctAnswer: 2,
    explanation: "해설",
  };
}

function paper(questions: unknown[]) {
  return { title: "제목", questions };
}

function errorsOf(data: unknown): string[] {
  const result = validatePaperData(data);
  assert.equal(result.ok, false);
  return result.ok ? [] : result.errors;
}

// 선생님이 question-papers에 넣은 파일에 문제가 있으면 여기서 실패하며 파일 이름과 이유를 보여줍니다.
test("question-papers 폴더의 모든 문제지가 형식에 맞는다", () => {
  const { papers, problems } = loadPapers();
  assert.deepEqual(problems, []);
  assert.ok(papers.length > 0, "question-papers 폴더에 문제지가 하나도 없습니다.");
});

test("예시 문제지는 제목과 10문항이 파일 그대로 들어온다", () => {
  const { papers } = loadPapers();
  const sample = papers.find((p) => p.id === "sample-questions");
  assert.ok(sample);
  assert.equal(sample.title, "중학교 정보과목");
  assert.equal(sample.questions.length, 10);
  assert.deepEqual(sample.questions, JSON.parse(sampleText).questions);
});

test("JSON 문법이 틀리면 거부한다", () => {
  const result = parsePaperText('{"title": "제목", "questions": [');
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors[0], /JSON 형식/);
});

test("제목(title)이 없거나 비어 있으면 거부한다", () => {
  assert.deepEqual(errorsOf({ questions: [validQuestion()] }), ["문제지 제목(title)이 비어 있습니다."]);
  assert.deepEqual(errorsOf({ title: " ", questions: [validQuestion()] }), ["문제지 제목(title)이 비어 있습니다."]);
});

test("questions가 없거나 비어 있으면 거부한다", () => {
  assert.deepEqual(errorsOf({ title: "제목" }), ["문항 목록(questions)이 없습니다."]);
  assert.deepEqual(errorsOf({ title: "제목", questions: "x" }), ["문항 목록(questions)이 없습니다."]);
  assert.deepEqual(errorsOf([]), ["문제지 형식이 올바르지 않습니다."]);
  assert.match(errorsOf(paper([]))[0], /하나도 없습니다/);
});

test("200문항을 넘으면 거부하고, 200문항은 허용한다", () => {
  assert.match(errorsOf(paper(Array.from({ length: 201 }, validQuestion)))[0], /200개까지/);
  assert.equal(validatePaperData(paper(Array.from({ length: 200 }, validQuestion))).ok, true);
});

test("보기가 4개가 아니면 몇 번 문항인지 알려준다", () => {
  const bad = { ...validQuestion(), options: ["가", "나", "다"] };
  const errors = errorsOf(paper([validQuestion(), validQuestion(), bad]));
  assert.deepEqual(errors, ["3번 문항: 보기가 4개가 아닙니다. 지금은 3개입니다."]);
});

test("정답 번호가 1~4 정수가 아니면 거부한다", () => {
  for (const correctAnswer of [0, 5, 2.5, "2", null]) {
    const errors = errorsOf(paper([{ ...validQuestion(), correctAnswer }]));
    assert.deepEqual(errors, ["1번 문항: 정답 번호(correctAnswer)는 1, 2, 3, 4 중 하나여야 합니다."]);
  }
});

test("빠진 항목과 빈 보기를 모두 알려준다", () => {
  const errors = errorsOf(paper([{ options: ["가", " ", "다", "라"], correctAnswer: 1 }, "문항 아님"]));
  assert.deepEqual(errors, [
    "1번 문항: 문제 내용(question)이 비어 있습니다.",
    "1번 문항: 2번 보기가 비어 있습니다.",
    "1번 문항: 해설(explanation)이 비어 있습니다.",
    "2번 문항: 문항 형식이 올바르지 않습니다.",
  ]);
});

test("점수는 소수 첫째 자리까지 반올림한다", () => {
  assert.equal(calculateScore(1, 3), 33.3);
  assert.equal(calculateScore(2, 3), 66.7);
  assert.equal(calculateScore(10, 10), 100);
  assert.equal(calculateScore(0, 10), 0);
  assert.equal(calculateScore(7, 10), 70);
});

test("예시 문제지를 채점하면 정답 번호(1부터 시작)와 비교한다", () => {
  const result = parsePaperText(sampleText);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const questions = result.questions;

  const allCorrect = gradeQuiz(questions, questions.map((q) => q.correctAnswer));
  assert.equal(allCorrect.correctCount, 10);
  assert.equal(allCorrect.score, 100);

  // 1번 문항 정답은 4번(키보드). 1~3번 문항만 틀리게 고른다.
  const answers = questions.map((q, i) => (i < 3 ? (q.correctAnswer % 4) + 1 : q.correctAnswer));
  const graded = gradeQuiz(questions, answers);
  assert.equal(graded.correctCount, 7);
  assert.equal(graded.score, 70);
  assert.deepEqual(graded.results.map((r) => r.isCorrect), [false, false, false, true, true, true, true, true, true, true]);
  assert.equal(questions[0].options[questions[0].correctAnswer - 1], "키보드");
});
