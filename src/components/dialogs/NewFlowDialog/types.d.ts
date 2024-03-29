import type { AmbiguityHandling } from "../AmbiguitySelect";

export interface DegreeSelectState {
  majors: string[];
  selected: string;
  ambiguityHandling: AmbiguityHandling;
  errorMsg: string;
}

export interface CurriculumSelectState {
  selected: string;
  includeExternal: boolean;
  ambiguityHandling: AmbiguityHandling;
  errorMsg: string;
}

export interface TextSearchState {
  text: string;
  ambiguityHandling: AmbiguityHandling;
  errorMsg: string;
}
