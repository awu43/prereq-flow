const fs = require("fs");

function fileReadAndReplace(file, targetStr, replStr) {
  fs.writeFileSync(
    file, fs.readFileSync(file, "utf8").replace(targetStr, replStr), "utf8"
  );
}

fileReadAndReplace("build/dist/index.css", /dist\/source-sans/g, "source-sans");
// https://github.com/snowpackjs/snowpack/issues/3139
