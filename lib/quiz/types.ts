// 문제 파일(JSON)의 문항 한 개. correctAnswer는 1부터 시작하는 보기 번호입니다.
export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// 이용자가 고른 보기 번호(1~4). 아직 고르지 않았으면 null입니다.
export type Answer = number | null;
