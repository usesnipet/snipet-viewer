import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginClient } from "@kubb/plugin-client";
import { pluginReactQuery } from "@kubb/plugin-react-query";

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
