import type { BufferGeometry } from "three";
import type { ProjectSummary } from "@/lib/projects";

export type Atlas = { src: string; cols: number; rows: number };

/**
 * Contract shared by BillboardCards and InstancedCards so WorksScene can swap
 * renderers by card count without touching interaction logic.
 */
export type CardsRendererProps = {
  projects: ProjectSummary[];
  positions: [number, number, number][];
  geometry: BufferGeometry;
  activeIndex: number | null;
  atlas: Atlas | null;
  /** Called on pointer enter (true) / leave (false) of card `index`. */
  onHover: (index: number, hovered: boolean) => void;
  onSelect: (index: number) => void;
};
