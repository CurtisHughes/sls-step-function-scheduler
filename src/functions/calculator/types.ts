import { DurationObjectUnits } from "luxon";

export type Execution = {
  name: string;
  taskStartDateTime: string;
  executionStartDateTime: string;
  continue: boolean;
};

export type Job = {
  id: string;
  frequency: DurationObjectUnits;
  startDateTime: string;
  endDateTime: string;
};

export const DATE_TIME_FORMAT = "yyyyMMdd'T'HHmmss";
