import { atom } from "jotai";
import type { CourseData } from "types/main";

export const courseDataAtom = atom<CourseData[]>([]);
