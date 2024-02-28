import { Logger } from "winston";
import { ApiConfig } from "../api";
import { logger } from "../util/logger";

export type LoggerContext = {
  logger: Logger;
}

export async function addLoggerMiddleware<TContext extends object>(api: ApiConfig<TContext>) {
  (<ApiConfig<TContext & LoggerContext>>api).use(async (ctx, next) => {
    ctx.logger = logger.child({
      request: { id: ctx.request.id, deviceId: ctx.request.deviceInfo.id },
    });
    ctx.logger.info(`Incoming call to ${ctx.request.name}`);
    const result = await next();
    ctx.logger.info(`Call to ${ctx.request.name} completed`);
    return result;
  });
  return api as ApiConfig<TContext & LoggerContext>;
}
