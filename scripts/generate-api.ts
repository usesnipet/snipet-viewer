import { access, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { generateApi } from "swagger-typescript-api";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const projectRoot = resolve(currentDirPath, "..");

const input = process.env.OPENAPI_INPUT ?? resolve(projectRoot, "../snipet-core/swagger.yaml");
const output = resolve(projectRoot, "src");

await generateApi({
  input,
  output,
  fileName: "api.ts",
  generateClient: true,
  generateRouteTypes: false,
  generateResponses: false,
  extractRequestParams: false,
  extractRequestBody: false,
  extractResponseBody: false,
  extractResponseError: false,
  singleHttpClient: false,
  httpClientType: "fetch",
  cleanOutput: false,
});

const pascalCaseFile = resolve(output, "Api.ts");
const expectedFile = resolve(output, "api.ts");

try {
  await access(pascalCaseFile);
  await rm(expectedFile, { force: true });
  await rename(pascalCaseFile, expectedFile);
} catch {
  // noop: generator already emitted expected filename
}

console.log(`API client generated at ${output}/api.ts`);
