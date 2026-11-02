import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { QuestionPaper } from "./quiz/types.ts";
import { parsePaperText } from "./quiz/validate.ts";

export type PaperProblem = { fileName: string; errors: string[] };

// question-papers 폴더의 JSON 문제지를 파일 이름 순으로 읽습니다.
// 형식이 틀린 파일은 목록에서 빼고 problems로 돌려줍니다(npm test가 알려줌).
// 동기 방식으로 읽어야 Next.js가 빌드할 때 목록을 화면에 미리 넣어둡니다.
// 폴더 경로는 매번 그대로 적어야 Next.js가 프로젝트 전체를 배포 묶음에 넣지 않습니다.
export function loadPapers(): { papers: QuestionPaper[]; problems: PaperProblem[] } {
  const papers: QuestionPaper[] = [];
  const problems: PaperProblem[] = [];
  if (!existsSync(path.join(process.cwd(), "question-papers"))) return { papers, problems };

  const fileNames = readdirSync(path.join(process.cwd(), "question-papers"))
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();

  for (const fileName of fileNames) {
    const result = parsePaperText(readFileSync(path.join(process.cwd(), "question-papers", fileName), "utf8"));
    if (result.ok) {
      papers.push({ id: fileName.slice(0, -".json".length), title: result.title, questions: result.questions });
    } else {
      problems.push({ fileName, errors: result.errors });
    }
  }
  return { papers, problems };
}
