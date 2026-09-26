import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-6 pt-28 pb-24">
      <Link href="/#works" className="text-sm text-muted hover:text-foreground">
        ← Works
      </Link>
      <header className="mt-8">
        <p className="text-sm text-muted">
          {project.year} · {project.tags.join(" · ")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{project.title}</h1>
        {project.summary && <p className="mt-4 text-lg text-muted">{project.summary}</p>}
      </header>
      <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl bg-surface">
        <Image
          src={project.thumbnail}
          alt=""
          fill
          priority
          unoptimized={project.thumbnail.endsWith(".svg")}
          sizes="(min-width: 768px) 768px, 100vw"
          placeholder={project.blurDataURL ? "blur" : "empty"}
          blurDataURL={project.blurDataURL}
          className="object-cover"
        />
      </div>
      <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
        <MDXRemote source={project.content} />
      </div>
    </article>
  );
}
