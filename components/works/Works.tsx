"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ProjectSummary } from "@/lib/projects";
import type { Atlas } from "./scene/types";
import { useWorksCapabilities } from "./useWorksCapabilities";
import WorksList from "./WorksList";

// three.js stays out of the initial bundle; loaded only when the 3D view is shown.
const WorksScene = dynamic(() => import("./scene/WorksScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-surface motion-reduce:animate-none" />,
});

type View = "3d" | "list";

export default function Works({ projects, atlas }: { projects: ProjectSummary[]; atlas: Atlas | null }) {
  const router = useRouter();
  const caps = useWorksCapabilities();
  const [userView, setUserView] = useState<View | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [nearView, setNearView] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  const defaultView: View = caps.webgl && !caps.reducedMotion && !caps.mobile ? "3d" : "list";
  const view: View = !caps.ready || !caps.webgl ? "list" : (userView ?? defaultView);

  // inView drives frameloop; nearView (with margin) lazily mounts the scene before it scrolls in.
  useEffect(() => {
    const el = stage.current;
    if (!el || view !== "3d") return;
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setNearView(true), { rootMargin: "400px" });
    visible.observe(el);
    near.observe(el);
    return () => {
      visible.disconnect();
      near.disconnect();
    };
  }, [view]);

  useEffect(() => {
    projects.forEach((p) => router.prefetch(`/work/${p.slug}`));
  }, [projects, router]);

  const handleHover = useCallback((index: number, hovered: boolean) => {
    setActiveIndex((prev) => (hovered ? index : prev === index ? null : prev));
    document.body.style.cursor = hovered ? "pointer" : "";
  }, []);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
    setSelectedIndex(index);
  }, []);

  const handleArrive = useCallback(
    (index: number) => {
      document.body.style.cursor = "";
      router.push(`/work/${projects[index].slug}`);
    },
    [projects, router],
  );

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (selectedIndex !== null || projects.length === 0) return;
    const last = projects.length - 1;
    const step = (d: number) => setActiveIndex((i) => (i === null ? (d > 0 ? 0 : last) : (i + d + projects.length) % projects.length));
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        step(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        step(-1);
        break;
      case "Home":
        setActiveIndex(0);
        break;
      case "End":
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        if (activeIndex === null) return;
        handleSelect(activeIndex);
        break;
      case "Escape":
        setActiveIndex(null);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const active = activeIndex !== null ? projects[activeIndex] : null;

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <div role="group" aria-label="보기 방식" className="inline-flex rounded-full border border-line p-1 text-sm">
          {(["3d", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              disabled={v === "3d" && caps.ready && !caps.webgl}
              onClick={() => setUserView(v)}
              className="rounded-full px-4 py-1.5 transition-colors aria-pressed:bg-foreground aria-pressed:text-background disabled:opacity-40"
            >
              {v === "3d" ? "3D" : "리스트"}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <WorksList projects={projects} />
      ) : (
        <div
          ref={stage}
          tabIndex={0}
          role="application"
          aria-roledescription="3D 프로젝트 탐색기"
          aria-label="프로젝트 네트워크. 방향키로 이동, Enter로 열기, Esc로 해제."
          onKeyDown={onKeyDown}
          onBlur={() => selectedIndex === null && setActiveIndex(null)}
          className="relative h-[75vh] min-h-[520px] cursor-grab rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        >
          {nearView && (
            <WorksScene
              projects={projects}
              atlas={atlas}
              activeIndex={activeIndex}
              selectedIndex={selectedIndex}
              inView={inView}
              reducedMotion={caps.reducedMotion}
              onHover={handleHover}
              onSelect={handleSelect}
              onArrive={handleArrive}
            />
          )}
          <p aria-live="polite" className="sr-only">
            {active ? `${activeIndex! + 1} / ${projects.length}: ${active.title}, ${active.year}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
