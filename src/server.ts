import createApp from "./app";
import {connectToDatabase} from "./index";
import CustomLogger from "./common/utils/errorLogger";
import config from "./common/config/index";

const appServer = async () => {
  const app = await createApp();
  if (require.main ===  module) {
    app.listen(config.port);
  }
};

const startApp = async () => {
  try {
    await connectToDatabase;
    await appServer();
    return CustomLogger.info(`connect to the database and server running on port ${config.port}`);
  } catch (e) {
    console.log(e);
    return CustomLogger.info(`failed to connect the database`);
  }
};

startApp();
