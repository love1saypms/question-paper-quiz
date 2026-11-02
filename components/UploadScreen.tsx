"use client";

import { useState, type ChangeEvent } from "react";
import type { Question } from "@/lib/quiz/types";
import { checkFileSize, parseQuizText } from "@/lib/quiz/validate";

// 오류가 너무 많으면 앞부분만 보여줍니다.
const MAX_SHOWN_ERRORS = 10;

type Props = {
  onLoaded: (fileName: string, questions: Question[]) => void;
};

export default function UploadScreen({ onLoaded }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const [failedName, setFailedName] = useState("");

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // 같은 파일을 고친 뒤 다시 골라도 알아챌 수 있게 선택을 비웁니다.
    input.value = "";
    if (!file) return;

    const sizeError = checkFileSize(file.size);
    if (sizeError) {
      setFailedName(file.name);
      setErrors([sizeError]);
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      setFailedName(file.name);
      setErrors(["파일을 열 수 없습니다. 다른 파일을 골라주세요."]);
      return;
    }

    const result = parseQuizText(text);
    if (!result.ok) {
      setFailedName(file.name);
      setErrors(result.errors);
      return;
    }
    onLoaded(file.name, result.questions);
  }

  const hiddenCount = errors.length - MAX_SHOWN_ERRORS;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">문제풀이</h1>
        <p className="text-slate-600">
          선생님께 받은 문제 파일(JSON)을 올리면 문제를 풀 수 있습니다. 모든 문제를 푼 뒤에 점수와 해설을 볼 수 있습니다.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-4 font-medium">문제 파일(JSON)을 선택해주세요.</p>
        <label className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white hover:bg-blue-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 sm:w-auto sm:inline-flex">
          파일 선택
          <input type="file" accept=".json,application/json" className="sr-only" onChange={handleChange} />
        </label>
        <p className="mt-3 text-sm text-slate-500">1MB 이하, 200문항까지 올릴 수 있습니다. 파일은 인터넷으로 보내지 않고 이 화면에서만 읽습니다.</p>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-semibold">“{failedName}” 파일을 사용할 수 없습니다.</p>
          <p className="mt-1 text-sm">아래 내용을 고친 뒤 다시 올려주세요.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {errors.slice(0, MAX_SHOWN_ERRORS).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
          {hiddenCount > 0 && <p className="mt-2 text-sm">그 밖에 고칠 곳이 {hiddenCount}개 더 있습니다.</p>}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 sm:p-6">
        <p className="font-semibold text-slate-900">문제 파일 형식</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>questions 목록 안에 문항을 넣습니다.</li>
          <li>문항마다 문제(question), 보기 4개(options), 정답 번호 1~4(correctAnswer), 해설(explanation)이 있어야 합니다.</li>
          <li>정답 번호가 1이면 첫 번째 보기가 정답입니다.</li>
        </ul>
        <a href="/sample-questions.json" download className="mt-4 inline-block font-medium text-blue-700 underline underline-offset-4">
          예시 파일 받기
        </a>
      </div>
    </section>
  );
}
