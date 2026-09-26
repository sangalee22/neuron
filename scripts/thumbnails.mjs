// Generates Works-section assets from content/projects/*.mdx frontmatter:
//   public/thumbs/<slug>.webp   512px card texture
//   public/thumbs/atlas.webp    texture atlas for the InstancedMesh renderer (>50 cards)
//   lib/generated/thumbs.json   blur placeholders + atlas layout
// Runs automatically before `dev` and `build`.
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "content/projects");
const OUT_DIR = path.join(ROOT, "public/thumbs");
const MANIFEST = path.join(ROOT, "lib/generated/thumbs.json");

// Keep in sync with CARD_ASPECT in lib/works/constants.ts (4:3).
const THUMB = { width: 512, height: 384 };
const BLUR = { width: 16, height: 12 };
const TILE = { width: 256, height: 192 };
const MAX_ATLAS = 4096;

async function mtime(file) {
  try {
    return (await fs.stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const files = (await fs.readdir(PROJECTS_DIR)).filter((f) => f.endsWith(".mdx")).sort();
  const entries = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const { data } = matter(await fs.readFile(path.join(PROJECTS_DIR, file), "utf8"));
    if (!data.thumbnail) {
      console.warn(`[thumbs] ${file}: no thumbnail in frontmatter, skipped`);
      continue;
    }
    const src = path.join(ROOT, "public", data.thumbnail);
    if (!(await mtime(src))) {
      console.warn(`[thumbs] ${file}: ${data.thumbnail} not found, skipped`);
      continue;
    }

    const out = path.join(OUT_DIR, `${slug}.webp`);
    if ((await mtime(out)) < (await mtime(src))) {
      await sharp(src).resize(THUMB.width, THUMB.height, { fit: "cover" }).webp({ quality: 78 }).toFile(out);
    }
    const blur = await sharp(src).resize(BLUR.width, BLUR.height, { fit: "cover" }).webp({ quality: 40 }).toBuffer();

    entries.push({ slug, src, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` });
  }

  // Atlas: square-ish grid of fixed-size tiles, capped at MAX_ATLAS px per side.
  const cols = Math.max(1, Math.ceil(Math.sqrt(entries.length)));
  const rows = Math.max(1, Math.ceil(entries.length / cols));
  const atlasW = cols * TILE.width;
  const atlasH = rows * TILE.height;
  if (atlasW > MAX_ATLAS || atlasH > MAX_ATLAS) {
    console.warn(`[thumbs] atlas ${atlasW}x${atlasH} exceeds ${MAX_ATLAS}px; lower TILE size`);
  }
  if (entries.length > 0) {
    const tiles = await Promise.all(
      entries.map(async (e, i) => ({
        input: await sharp(e.src).resize(TILE.width, TILE.height, { fit: "cover" }).toBuffer(),
        left: (i % cols) * TILE.width,
        top: Math.floor(i / cols) * TILE.height,
      })),
    );
    await sharp({ create: { width: atlasW, height: atlasH, channels: 3, background: "#111111" } })
      .composite(tiles)
      .webp({ quality: 75 })
      .toFile(path.join(OUT_DIR, "atlas.webp"));
  }

  const manifest = {
    atlas: { src: "/thumbs/atlas.webp", cols, rows },
    projects: Object.fromEntries(
      entries.map((e, i) => [e.slug, { thumb: `/thumbs/${e.slug}.webp`, blurDataURL: e.blurDataURL, atlasIndex: i }]),
    ),
  };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`[thumbs] ${entries.length} project(s) processed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
