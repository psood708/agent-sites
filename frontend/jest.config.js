const path = require("path");

/** @type {import("jest").Config} */
module.exports = {
  rootDir: path.resolve(__dirname, ".."),
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      path.resolve(__dirname, "node_modules/ts-jest"),
      { tsconfig: { jsx: "react-jsx" }, diagnostics: false },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": path.resolve(__dirname, "$1"),
  },
  testMatch: ["<rootDir>/tests/frontend/**/*.test.tsx"],
  moduleDirectories: ["node_modules", path.resolve(__dirname, "node_modules")],
};
