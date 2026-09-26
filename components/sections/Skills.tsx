import { skills } from "@/content/profile";
import Section from "./Section";

export default function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="할 수 있는 것들">
      <div className="grid gap-10 md:grid-cols-3">
        {skills.map((s) => (
          <div key={s.group}>
            <h3 className="text-sm text-muted">{s.group}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.items.map((item) => (
                <li key={item} className="rounded-full border border-line px-3 py-1.5 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
