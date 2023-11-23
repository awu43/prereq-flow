import { atom } from "jotai";
import type { CourseData } from "types/main";

export const courseDataAtom = atom<CourseData[]>([]);
export const courseMapAtom = atom<Map<string, CourseData>>(
  get => new Map(get(courseDataAtom).map(c => [c.id, c])),
);
