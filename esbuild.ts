import * as esbuild from "esbuild";
import { createBuildSettings } from "./esbuild.config";

const settings = createBuildSettings({ minify: true });

await esbuild.build(settings);
