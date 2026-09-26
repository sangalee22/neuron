import Career from "@/components/sections/Career";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Section from "@/components/sections/Section";
import Skills from "@/components/sections/Skills";
import Works from "@/components/works/Works";
import { getAllProjects, getAtlas } from "@/lib/projects";

export default async function Home() {
  const [projects, atlas] = await Promise.all([getAllProjects(), getAtlas()]);

  return (
    <>
      <Hero />
      <Skills />
      <Career />
      <Section id="works" eyebrow="Works" title="연결된 작업들">
        <Works projects={projects} atlas={atlas} />
      </Section>
      <Contact />
    </>
  );
}
