import { experience, profile, projects, stack } from "./data";
import { HeroLight } from "./HeroLight";
import { ExperienceRow } from "./ExperienceRow";
import { Logo } from "./Logo";
import { ProjectRow } from "./ProjectRow";
import { Socials } from "./Socials";

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <header className="sec-head">
      <span className="sec-num">{num}</span>
      <h2>{title}</h2>
    </header>
  );
}

export function Intro() {
  return (
    <section className="sec sec-intro" aria-label="Introduction">
      <HeroLight />
      <div className="wrap">
        <h1 className="name raised">{profile.name}</h1>
        <p className="lede">{profile.tagline}</p>
        <Socials />
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="sec" id="experience" aria-label="Experience">
      <div className="wrap">
        <SectionHead num="01" title="Experience" />
        <ol className="xp-list">
          {experience.map((e) => (
            <ExperienceRow key={e.company} e={e} />
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section className="sec" id="projects" aria-label="Projects">
      <div className="wrap">
        <SectionHead num="02" title="Projects" />
        <ul className="proj">
          {projects.map((p) => (
            <ProjectRow key={p.name} p={p} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Stack() {
  return (
    <section className="sec" id="stack" aria-label="Stack">
      <div className="wrap">
        <SectionHead num="03" title="Stack" />
        <div className="stack">
          {stack.map((g) => (
            <div key={g.group}>
              <p className="stack-label">{g.group}</p>
              <ul className="stack-grid">
                {g.items.map((it) => (
                  <li key={it.name} title={it.name}>
                    <Logo name={it.logo} layer="base" className="stack-logo" />
                    <span className="stack-name">{it.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="sec" id="contact" aria-label="Contact">
      <div className="wrap">
        <SectionHead num="04" title="Contact" />
        <p className="contact-big raised">Let&rsquo;s talk.</p>
        <p className="contact-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p className="footer">© 2026 {profile.name}</p>
      </div>
    </section>
  );
}
