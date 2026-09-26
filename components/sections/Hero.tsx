import { profile } from "@/content/profile";

export default function Hero() {
  return (
    <section id="top" className="mx-auto flex min-h-[90svh] w-full max-w-6xl flex-col justify-center px-6 pt-24">
      <p className="text-sm font-medium tracking-widest text-accent uppercase">{profile.role}</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance md:text-6xl">
        {profile.headline}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.intro}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href="#works" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background">
          작업물 보기
        </a>
        <a href="#contact" className="rounded-full border border-line px-6 py-3 text-sm font-medium">
          연락하기
        </a>
      </div>
    </section>
  );
}
