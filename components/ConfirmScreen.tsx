type Props = {
  fileName: string;
  count: number;
  onStart: () => void;
};

export default function ConfirmScreen({ fileName, count, onStart }: Props) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">문항 확인</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-slate-500">파일 이름</dt>
            <dd className="text-lg font-medium">{fileName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">문항 수</dt>
            <dd className="text-lg font-medium">{count}문항</dd>
          </div>
        </dl>
        <p className="mt-4 text-slate-600">한 문제씩 풀고, 모든 문제에 답한 뒤 한 번에 채점합니다.</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        시작
      </button>
    </section>
  );
}
