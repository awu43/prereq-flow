import type { Campus, ConnectTo } from "types/main";

export interface UwCourseFormState {
  campus: Campus;
  searchText: string;
  connectTo: ConnectTo;
  alwaysAtZero: boolean;
  errorMsg: string;
}
