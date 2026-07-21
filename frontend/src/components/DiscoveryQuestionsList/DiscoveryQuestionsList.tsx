interface DiscoveryQuestionsListProps {
  questions: string[];
}

export default function DiscoveryQuestionsList({
  questions,
}: DiscoveryQuestionsListProps) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="discovery-questions-heading">
      <h2
        id="discovery-questions-heading"
        className="text-lg font-semibold text-slate-900">
        Discovery Questions
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {questions.length} questions to guide your next conversation
      </p>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
        {questions.map((q, i) => (
          <li key={i} className="pl-1">
            {q}
          </li>
        ))}
      </ol>
    </section>
  );
}
