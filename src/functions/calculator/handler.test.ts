import { Context, Callback } from "aws-lambda";
import { DateTime } from "luxon";
import { calculator } from "./handler";
import { Execution, Job, DATE_TIME_FORMAT } from "./types";

let currentExecution: Execution;
let currentJob: Job;
let currentDate: DateTime;
let startDate: DateTime;

beforeEach(() => {
  currentDate = DateTime.now();
  currentExecution = {
    name: `job_${currentDate.toISO()}`,
    taskStartDateTime: currentDate.toISO(),
    executionStartDateTime: currentDate.toISO(),
    continue: true,
  };
  currentJob = {
    id: "job",
    frequency: {
      minutes: 5,
    },
    startDateTime: currentDate.toISO(),
    endDateTime: currentDate.plus({ hour: 1 }).toISO(),
  };
});

test("returns the next execution start date based on the job frequency", async () => {
  const expectedDate = currentDate.plus({ minutes: 5 });
  const exec = await calculator(
    { execution: currentExecution, job: currentJob },
    {} as Context,
    {} as Callback
  );
  expect(exec).toStrictEqual({
    name: `job_${expectedDate.toFormat(DATE_TIME_FORMAT)}`,
    taskStartDateTime: expectedDate.toISO(),
    continue: true,
  });
});

test("stops when next date is past the jobs end date", async () => {
  currentJob.endDateTime = currentDate.plus({ minutes: 4 }).toISO();
  const expectedDate = currentDate.plus({ minutes: 5 });
  const exec = await calculator(
    { execution: currentExecution, job: currentJob },
    {} as Context,
    {} as Callback
  );
  expect(exec).toStrictEqual({
    name: `job_${expectedDate.toFormat(DATE_TIME_FORMAT)}`,
    taskStartDateTime: `${expectedDate.toISO()}`,
    continue: false,
  });
});

test("skips ahead if the start date occurs before the current date", async () => {
  startDate = DateTime.fromISO('2018-01-01T00:00:00.000-06:00');
  currentDate = DateTime.fromISO('2019-01-01T00:00:00.000-06:00');
  currentExecution = {
    name: `job_${currentDate.toISO()}`,
    taskStartDateTime: startDate.toISO(),
    executionStartDateTime: currentDate.toISO(),
    continue: true,
  };
  currentJob = {
    id: "job",
    frequency: {
      minutes: 5,
    },
    startDateTime: startDate.toISO(),
    endDateTime: currentDate.plus({ hour: 1 }).toISO(),
  };

  const expectedDate = currentDate.plus({ minutes: 5 });
  const exec = await calculator(
    { execution: currentExecution, job: currentJob },
    {} as Context,
    {} as Callback
  );
  expect(exec).toStrictEqual({
    name: `job_${expectedDate.toFormat(DATE_TIME_FORMAT)}`,
    taskStartDateTime: expectedDate.toISO(),
    continue: true,
  });
});
