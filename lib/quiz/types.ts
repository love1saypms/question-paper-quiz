// 문제지 파일(JSON)의 문항 한 개. correctAnswer는 1부터 시작하는 보기 번호입니다.
export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// question-papers 폴더의 문제지 한 개. id는 확장자를 뺀 파일 이름입니다.
export type QuestionPaper = {
  id: string;
  title: string;
  questions: Question[];
};

// 이용자가 고른 보기 번호(1~4). 아직 고르지 않았으면 null입니다.
export type Answer = number | null;
