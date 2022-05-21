import { createRequire } from "module";
import _ from "lodash";

import path from "path"
import minimist from "minimist"
import _dotenv from "dotenv"

const require = createRequire(import.meta.url);
const currentFilePath = import.meta.url.replace(/^file:\/\//g, "")
let __dirname = path.resolve(currentFilePath);
__dirname = "/" + _.initial(__dirname.split("/")).join("/")

const args = minimist(process.argv.slice(2))
const dotenv = _dotenv.config({path: path.join(__dirname, "../.env")});
const _env = dotenv.parsed;

const config = require("./config.json");

export default () => ({
    ...config,
    ..._env,
        args
})
