import "dotenv/config";

import { SdkgenHttpServer } from "@sdkgen/node-runtime";

import { api } from "./api";
import { logger } from "./util/logger";
import { loadMiddlewares } from "./middlewares";
import { loadHandlers } from "./handlers";

const port = Number(process.env.PORT || 3000);

async function init() {
  await loadMiddlewares(api);
  await loadHandlers(api);
  const server = new SdkgenHttpServer(api);
  await server.listen(port);
  logger.info(`Server running on port ${port}`);
}

init();
