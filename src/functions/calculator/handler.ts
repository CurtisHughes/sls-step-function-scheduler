import { Handler } from "aws-lambda";
import { DateTime } from 'luxon';
import { Execution, Job, DATE_TIME_FORMAT } from "./types";

export type Event = {
  job: Job;
  execution: Execution;
};

export const calculator: Handler<Event, Omit<Execution, 'executionStartDateTime'>> = async ({ job, execution }: Event) => {
  const executionStartDateTime = DateTime.fromISO(execution.executionStartDateTime);
  const taskStartDateTime = DateTime.fromISO(execution.taskStartDateTime);
  const nextTaskStartDateTime = ((executionStartDateTime > taskStartDateTime) ? executionStartDateTime : taskStartDateTime).plus(job.frequency);

  return {
    name: `${job.id}_${nextTaskStartDateTime.toFormat(DATE_TIME_FORMAT)}`,
    taskStartDateTime: nextTaskStartDateTime.toISO(),
    continue: nextTaskStartDateTime <= DateTime.fromISO(job.endDateTime),
  };
}
