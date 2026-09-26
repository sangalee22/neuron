import { profile } from "@/content/profile";
import Section from "./Section";

export default function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="함께 이야기해요">
      <a href={`mailto:${profile.email}`} className="text-2xl font-medium underline-offset-8 hover:underline md:text-4xl">
        {profile.email}
      </a>
      <ul className="mt-10 flex flex-wrap gap-6 text-muted">
        {profile.links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-foreground">
              {l.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
