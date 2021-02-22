import { Handler } from "aws-lambda";

export type Context = {
  name: string;
}

export type Event = {
  context: Context;
};

export const task: Handler<Event, undefined> = ({ context: { name } }) => {
  console.log(`Hello ${name}!`);
};
