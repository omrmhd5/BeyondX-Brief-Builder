import BezelCard from "../ui/BezelCard";

interface DiscoveryQuestionsListProps {
  questions: string[];
  embedded?: boolean;
  revealDelay?: number;
}

export default function DiscoveryQuestionsList({
  questions,
  embedded = false,
  revealDelay = 0,
}: DiscoveryQuestionsListProps) {
  const content = (
    <section
      aria-labelledby="discovery-questions-heading"
      className="p-6 sm:p-8">
      <h2
        id="discovery-questions-heading"
        className="text-lg font-semibold tracking-tight text-white">
        Discovery Questions
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        {questions.length} questions to guide your next conversation
      </p>
      <ol className="mt-6 space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-violet-300">
              {i + 1}
            </span>
            <p className="pt-1 text-sm leading-relaxed text-zinc-300">{q}</p>
          </li>
        ))}
      </ol>
    </section>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
        {content}
      </div>
    );
  }

  return (
    <BezelCard revealDelay={revealDelay} innerClassName="">
      {content}
    </BezelCard>
  );
}
