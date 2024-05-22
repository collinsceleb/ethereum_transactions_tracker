import merge from "lodash/merge";
import environmentConfig from "./environment";

const env = process.env.NODE_ENV || "local";

const defaultConfig = {
  env,
  constants: {},
};

const config = merge(defaultConfig, environmentConfig);

export default config;
