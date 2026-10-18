import { Contact, Education, Experience, Intro, Projects, Stack } from "@/components/Sections";

export default function Home() {
  return (
    <main>
      <Intro />
      <Experience />
      <Projects />
      <Education />
      <Stack />
      <Contact />
    </main>
  );
}
