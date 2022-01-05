import { ExecutionContext } from "ava";

export const isTitleMacro = (t: ExecutionContext, actual: string): void =>
	t.is(actual, t.title);
