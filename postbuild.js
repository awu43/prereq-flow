const fs = require("fs");

const correctedEnvJs = (
  fs.readFileSync("./build/_snowpack/env.js", "utf8")
    .replace(
      "MODE=\"development\",NODE_ENV=\"development\"",
      "MODE=\"production\",NODE_ENV=\"production\"",
    )
);

fs.writeFileSync("./build/_snowpack/env.js", correctedEnvJs, "utf8");
