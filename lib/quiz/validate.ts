import type { Question } from "./types";

export const MAX_FILE_BYTES = 1024 * 1024;
export const MAX_QUESTIONS = 200;
export const OPTION_COUNT = 4;

export type ParseResult =
  | { ok: true; questions: Question[] }
  | { ok: false; errors: string[] };

export function checkFileSize(bytes: number): string | null {
  if (bytes > MAX_FILE_BYTES) {
    return "파일이 너무 큽니다. 1MB 이하의 파일만 올릴 수 있습니다.";
  }
  return null;
}

export function parseQuizText(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      ok: false,
      errors: ["파일 내용을 읽을 수 없습니다. JSON 형식에 맞게 작성되었는지 확인해주세요."],
    };
  }
  return validateQuizData(data);
}

// 오류가 하나라도 있으면 파일 전체를 거부합니다. 일부 문항만 건너뛰지 않습니다.
export function validateQuizData(data: unknown): ParseResult {
  if (!isRecord(data) || !Array.isArray(data.questions)) {
    return { ok: false, errors: ["파일에 문항 목록(questions)이 없습니다."] };
  }

  const items: unknown[] = data.questions;
  if (items.length === 0) {
    return { ok: false, errors: ["문항 목록(questions)에 문항이 하나도 없습니다."] };
  }
  if (items.length > MAX_QUESTIONS) {
    return {
      ok: false,
      errors: [`문항은 ${MAX_QUESTIONS}개까지만 올릴 수 있습니다. 이 파일에는 ${items.length}개가 있습니다.`],
    };
  }

  const errors: string[] = [];
  items.forEach((item, i) => errors.push(...checkQuestion(item, i + 1)));
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, questions: items as Question[] };
}

function checkQuestion(item: unknown, n: number): string[] {
  const label = `${n}번 문항`;
  if (!isRecord(item)) {
    return [`${label}: 문항 형식이 올바르지 않습니다.`];
  }

  const errors: string[] = [];

  if (!isFilledString(item.question)) {
    errors.push(`${label}: 문제 내용(question)이 비어 있습니다.`);
  }

  if (!Array.isArray(item.options)) {
    errors.push(`${label}: 보기 목록(options)이 없습니다.`);
  } else if (item.options.length !== OPTION_COUNT) {
    errors.push(`${label}: 보기가 ${OPTION_COUNT}개가 아닙니다. 지금은 ${item.options.length}개입니다.`);
  } else {
    item.options.forEach((option, k) => {
      if (!isFilledString(option)) {
        errors.push(`${label}: ${k + 1}번 보기가 비어 있습니다.`);
      }
    });
  }

  const answer = item.correctAnswer;
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 1 || answer > OPTION_COUNT) {
    errors.push(`${label}: 정답 번호(correctAnswer)는 1, 2, 3, 4 중 하나여야 합니다.`);
  }

  if (!isFilledString(item.explanation)) {
    errors.push(`${label}: 해설(explanation)이 비어 있습니다.`);
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}
