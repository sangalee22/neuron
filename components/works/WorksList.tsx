import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/projects";

export default function WorksList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/work/${p.slug}`}
            className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
              <Image
                src={p.thumb}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                placeholder={p.blurDataURL ? "blur" : "empty"}
                blurDataURL={p.blurDataURL}
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <h3 className="font-medium">{p.title}</h3>
              <span className="text-sm text-muted">{p.year}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{p.tags.join(" · ")}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
