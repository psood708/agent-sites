import type { Config } from "jest";
import path from "path";

const config: Config = {
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

export default config;
