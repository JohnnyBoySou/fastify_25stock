import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    test: {
        testTimeout: 15000, // ⏱️ 10 segundos globais
        hookTimeout: 15000, // ⏱️ pra beforeAll/afterAll
    },
});
