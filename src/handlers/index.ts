import { ApiConfig } from "../api";
import { LoggerContext } from "../middlewares/logger";
import { registerUserHandler } from "./user";

export async function loadHandlers<TContext extends object>(
  api: ApiConfig<TContext>
) {
  await registerUserHandler<LoggerContext>(api as any);
}
