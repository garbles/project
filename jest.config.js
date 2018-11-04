const path = require("path");
const tsConfig = require("./tsconfig.json");

const rootDir = path.join(process.cwd(), "src");

module.exports = {
  preset: "ts-jest",
  rootDir,
  globals: {
    "ts-jest": {
      tsConfig: tsConfig.compilerOptions
    }
  }
};
