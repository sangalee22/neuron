import type { ReactNode } from "react";

export default function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24 md:py-32">
      <p className="text-sm font-medium tracking-widest text-accent uppercase">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <div className="mt-12">{children}</div>
    </section>
  );
}
