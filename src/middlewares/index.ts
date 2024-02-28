import { ApiConfig } from "../api";
import { addErrorMiddleware } from "./error";
import { addLoggerMiddleware } from "./logger";

export async function loadMiddlewares<TContext extends object>(api: ApiConfig<TContext>) {
  await addLoggerMiddleware(api);
  await addErrorMiddleware(api as any);
}