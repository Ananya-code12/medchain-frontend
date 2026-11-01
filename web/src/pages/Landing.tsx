import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle";
import HeroDemo from "../components/HeroDemo";
import Reveal from "../components/Reveal";
import Logo from "../components/Logo";

const steps = ["s1", "s2", "s3"] as const;
const audiences = ["f1", "f2", "f3"] as const;
const promises = ["p1", "p2", "p3", "p4"] as const;
const faqs = ["q1", "q2", "q3", "q4"] as const;

export default function Landing() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-10 border-b border-line bg-panel transition-shadow ${scrolled ? "shadow-md" : ""}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 p-3">
          <Logo />
          <div className="flex gap-2"><LanguageToggle /><Link to="/login" className="btn-primary">{t("landing.signin")}</Link></div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <Reveal>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{t("landing.title")}</h1>
            <p className="mt-4 text-lg">{t("landing.sub")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary lift">{t("landing.cta")}</Link>
              <a href="#how" className="btn-ghost">{t("landing.how")}</a>
            </div>
            <p className="mt-6 border-l-4 border-brand pl-3">{t("landing.problem")}</p>
          </Reveal>
          <Reveal delay={150}>
            <HeroDemo />
            <p className="mt-2 text-sm">{t("landing.demoPause")}</p>
          </Reveal>
        </section>

        <section id="how" className="scroll-mt-24 py-8">
          <Reveal><h2 className="mb-4 text-2xl font-bold">{t("landing.howTitle")}</h2></Reveal>
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 120} className="card lift">
                <span className="pill mb-2 bg-brand text-white" aria-hidden="true">{i + 1}</span>
                <h3 className="text-lg font-bold">{t(`landing.${s}t`)}</h3>
                <p className="mt-1">{t(`landing.${s}d`)}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="py-8">
          <Reveal><h2 className="mb-4 text-2xl font-bold">{t("landing.forTitle")}</h2></Reveal>
          <ul className="grid gap-4 md:grid-cols-3">
            {audiences.map((a, i) => (
              <Reveal as="li" key={a} delay={i * 120} className="card lift">
                <h3 className="text-lg font-bold">{t(`landing.${a}t`)}</h3><p className="mt-1">{t(`landing.${a}d`)}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="py-8">
          <Reveal><h2 className="mb-4 text-2xl font-bold">{t("landing.privTitle")}</h2></Reveal>
          <ul className="grid gap-4 md:grid-cols-2">
            {promises.map((p, i) => (
              <Reveal as="li" key={p} delay={(i % 2) * 120} className="card lift border-l-4 border-l-ok">
                <h3 className="text-lg font-bold">{t(`landing.${p}t`)}</h3><p className="mt-1">{t(`landing.${p}d`)}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="py-8">
          <Reveal><h2 className="mb-4 text-2xl font-bold">{t("landing.faqTitle")}</h2></Reveal>
          <Reveal className="space-y-2">
            {faqs.map((q) => (
              <details key={q} className="card group">
                <summary className="cursor-pointer text-lg font-bold">{t(`landing.${q}`)}</summary>
                <p className="mt-2">{t(`landing.a${q.slice(1)}`)}</p>
              </details>
            ))}
          </Reveal>
        </section>

        <Reveal as="section" className="my-10 rounded-xl bg-brand p-8 text-center text-white">
          <h2 className="text-2xl font-bold">{t("landing.endTitle")}</h2>
          <Link to="/login" className="btn lift mt-4 bg-white text-brand hover:bg-brand-soft">{t("landing.cta")}</Link>
        </Reveal>
      </main>
      <footer className="border-t border-line bg-panel p-4 text-center text-sm">{t("landing.foot")}</footer>
    </>
  );
}
