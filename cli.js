#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const cwd = process.cwd();
const tsConfig = require("./tsconfig.json");
const buildDir = path.join(cwd, "build");
const srcDir = path.join(cwd, "src");
const jestConfig = require.resolve("./jest.config.js");

const command = process.argv[2];
const extras = process.argv.slice(3);

const LICENSETmpl = `Copyright ${new Date().getFullYear()} (c) Gabe Scholz

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;

const prettierRcTmpl = `{
  "printWidth": 100
}`;

const gitIgnoreTmpl = `node_modules
yarn-error.log
build`;

const npmIgnoreTmpl = `.prettierrc
yarn-error.log
yarn.lock
src
tsconfig.json`;

const tsConfigTmpl = `{ "extends": "./node_modules/@garbles/project/tsconfig.json" }`;

const init = () => {
  const pkg = path.join(cwd, "package.json");
  const json = require(pkg);

  json.scripts = json.scripts || {};

  ["build", "test", "clean", "prepublish"].forEach(cmd => {
    json.scripts[cmd] = json.scripts[cmd] || `project ${cmd}`;
  });

  fs.writeFileSync(path.join(cwd, "LICENSE"), LICENSETmpl);
  fs.writeFileSync(path.join(cwd, ".prettierrc"), prettierRcTmpl);
  fs.writeFileSync(path.join(cwd, ".gitignore"), gitIgnoreTmpl);
  fs.writeFileSync(path.join(cwd, ".npmignore"), npmIgnoreTmpl);
  fs.writeFileSync(path.join(cwd, "tsconfig.json"), tsConfigTmpl);
  fs.writeFileSync(pkg, JSON.stringify(json, null, 2));
  fs.mkdirSync(path.join(cwd, "src"));
  fs.writeFileSync(path.join(cwd, "src", "index.ts"), "");
};

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
  case "init":
    init();
    break;
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
