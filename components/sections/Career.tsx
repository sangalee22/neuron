import { career } from "@/content/profile";
import Section from "./Section";

export default function Career() {
  return (
    <Section id="career" eyebrow="Career" title="걸어온 길">
      <ol className="relative border-l border-line">
        {career.map((c) => (
          <li key={`${c.period}-${c.company}`} className="relative pb-12 pl-8 last:pb-0">
            <span aria-hidden className="absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="text-sm text-muted">{c.period}</p>
            <h3 className="mt-1 text-lg font-medium">
              {c.company} <span className="text-muted">· {c.role}</span>
            </h3>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted">{c.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
