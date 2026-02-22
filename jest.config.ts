import { createDefaultPreset } from "ts-jest";

/** @type {import("jest").Config} */
const tsJestTransformCfg = createDefaultPreset().transform;

export default {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
        "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    },
    preset: "ts-jest/presets/default-esm",
    moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
    setupFiles: ["dotenv/config"],
    testPathIgnorePatterns: ["/dist/", "\\.d\\.ts$"],
    moduleFileExtensions: ["ts", "js", "json", "node"],
    verbose: true,
};
