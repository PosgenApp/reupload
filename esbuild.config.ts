import { BuildOptions } from "esbuild";
import esbuildPluginTsc from "esbuild-plugin-tsc";

export function createBuildSettings(options: BuildOptions) {
	return {
		entryPoints: ["src/main.ts"],
		outdir: "dist",
		bundle: true,
		platform: "node",
		target: ["node22"],
		packages: "external",
		format: "esm",
		allowOverwrite: true,
		external: ["src/generated/*"],
		logLevel: "info",
		resolveExtensions: [".ts", ".js", ".json"],
		plugins: [
			esbuildPluginTsc({
				force: true,
				forceEsm: true,
			}),
		],
		...options,
	} as BuildOptions;
}
