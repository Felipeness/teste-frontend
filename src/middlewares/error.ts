import { Fatal, SdkgenError } from "@sdkgen/node-runtime";
import { ApiConfig } from "../api";
import { LoggerContext } from "./logger";

export async function addErrorMiddleware<TContext extends object>(
  api: ApiConfig<TContext & LoggerContext>
) {
  api.use(async (ctx, next) => {
    try {
      return await next();
    } catch (e) {
      ctx.logger.error(e);
      if (e instanceof SdkgenError) {
        throw e;
      }
      throw new Fatal(
        `Internal error: ${(<Error>e)?.message ?? "Unknown error"}`
      );
    }
  });
  return api;
}
