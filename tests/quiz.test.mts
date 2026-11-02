import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkFileSize, parseQuizText, validateQuizData, MAX_FILE_BYTES } from "../lib/quiz/validate.ts";
import { calculateScore, gradeQuiz } from "../lib/quiz/score.ts";

const sampleText = readFileSync(new URL("../sample-questions.json", import.meta.url), "utf8");

function validQuestion() {
  return {
    question: "문제",
    options: ["가", "나", "다", "라"],
    correctAnswer: 2,
    explanation: "해설",
  };
}

function errorsOf(data: unknown): string[] {
  const result = validateQuizData(data);
  assert.equal(result.ok, false);
  return result.ok ? [] : result.errors;
}

test("예시 파일은 통과하고 10문항이 그대로 들어온다", () => {
  const result = parseQuizText(sampleText);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.questions.length, 10);
  assert.deepEqual(result.questions, JSON.parse(sampleText).questions);
});

test("JSON 문법이 틀리면 거부한다", () => {
  const result = parseQuizText('{"questions": [');
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors[0], /JSON 형식/);
});

test("questions가 없거나 비어 있으면 거부한다", () => {
  assert.match(errorsOf({})[0], /questions\)이 없습니다/);
  assert.match(errorsOf({ questions: "x" })[0], /questions\)이 없습니다/);
  assert.match(errorsOf([])[0], /questions\)이 없습니다/);
  assert.match(errorsOf({ questions: [] })[0], /하나도 없습니다/);
});

test("200문항을 넘으면 거부하고, 200문항은 허용한다", () => {
  assert.match(errorsOf({ questions: Array.from({ length: 201 }, validQuestion) })[0], /200개까지/);
  assert.equal(validateQuizData({ questions: Array.from({ length: 200 }, validQuestion) }).ok, true);
});

test("보기가 4개가 아니면 몇 번 문항인지 알려준다", () => {
  const bad = { ...validQuestion(), options: ["가", "나", "다"] };
  const errors = errorsOf({ questions: [validQuestion(), validQuestion(), bad] });
  assert.deepEqual(errors, ["3번 문항: 보기가 4개가 아닙니다. 지금은 3개입니다."]);
});

test("정답 번호가 1~4 정수가 아니면 거부한다", () => {
  for (const correctAnswer of [0, 5, 2.5, "2", null]) {
    const errors = errorsOf({ questions: [{ ...validQuestion(), correctAnswer }] });
    assert.deepEqual(errors, ["1번 문항: 정답 번호(correctAnswer)는 1, 2, 3, 4 중 하나여야 합니다."]);
  }
});

test("빠진 항목과 빈 보기를 모두 알려준다", () => {
  const errors = errorsOf({
    questions: [{ options: ["가", " ", "다", "라"], correctAnswer: 1 }, "문항 아님"],
  });
  assert.deepEqual(errors, [
    "1번 문항: 문제 내용(question)이 비어 있습니다.",
    "1번 문항: 2번 보기가 비어 있습니다.",
    "1번 문항: 해설(explanation)이 비어 있습니다.",
    "2번 문항: 문항 형식이 올바르지 않습니다.",
  ]);
});

test("파일 크기는 1MB까지 허용한다", () => {
  assert.equal(checkFileSize(MAX_FILE_BYTES), null);
  assert.match(checkFileSize(MAX_FILE_BYTES + 1) ?? "", /1MB/);
});

test("점수는 소수 첫째 자리까지 반올림한다", () => {
  assert.equal(calculateScore(1, 3), 33.3);
  assert.equal(calculateScore(2, 3), 66.7);
  assert.equal(calculateScore(10, 10), 100);
  assert.equal(calculateScore(0, 10), 0);
  assert.equal(calculateScore(7, 10), 70);
});

test("예시 파일을 채점하면 정답 번호(1부터 시작)와 비교한다", () => {
  const result = parseQuizText(sampleText);
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
