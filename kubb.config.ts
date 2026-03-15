import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import { pluginReactQuery } from "@kubb/plugin-react-query";

/**
 * A URL da API usada pelos hooks é aplicada em tempo de build via Vite:
 * - Defina VITE_API_URL no .env (ex.: VITE_API_URL="http://localhost:8852")
 * - O vite.config.ts injeta AXIOS_BASE para o client axios usado pelo gen
 */
export default defineConfig({
  root: ".",
  input: {
    path: "../snipet-core/swagger.yaml",
  },
  output: {
    path: "./src/gen",
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: {
        path: "types",
      },
    }),
    pluginClient({
      output: {
        path: "client",
      },
      group: { type: "tag" },
    }),
    pluginReactQuery({
      output: {
        path: "hooks",
      },
      group: { type: "tag" },
      client: {
        // Types (Client, RequestConfig, ResponseErrorConfig) from axios client; functions still from ../../client
        importPath: "@kubb/plugin-client/clients/axios",
      },
    }),
  ],
});
