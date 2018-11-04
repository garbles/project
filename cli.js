#!/usr/bin/env node

const path = require("path");
const cp = require("child_process");

const tsConfig = require("./tsconfig.json");
const buildDir = path.join(process.cwd(), "build");
const srcDir = path.join(process.cwd(), "src");
const jestConfig = require.resolve("./jest.config.js");

const command = process.argv[2];
const extras = process.argv.slice(3);

const exec = (...cmds) => {
  cmds.forEach(cmd =>
    cp.spawnSync(cmd.base, cmd.args.concat(extras), {
      stdio: "inherit"
    })
  );
};

const cleanCmd = () => {
  return {
    base: "rm",
    args: ["-rf", buildDir]
  };
};

const testCmd = () => {
  return {
    base: "jest",
    args: [srcDir, "--config", jestConfig]
  };
};

const buildCmd = () => {
  const options = Object.keys(tsConfig.compilerOptions).reduce(
    (opts, key) => opts.concat(`--${key}`, `${tsConfig.compilerOptions[key]}`),
    ["--outDir", buildDir]
  );

  return {
    base: "tsc",
    args: options.concat(`${srcDir}/index.ts`)
  };
};

switch (command) {
  case "build":
    exec(cleanCmd(), buildCmd());
    break;
  case "clean":
    exec(cleanCmd());
    break;
  case "test":
    exec(cleanCmd(), testCmd());
    break;
  case "prepublish":
    exec(cleanCmd(), testCmd(), buildCmd());
    break;
  default:
    console.error("Unknown command:", command);
    process.exit(1);
}
