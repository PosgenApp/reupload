import { Router } from "hyper-express";
import LiveDirectory from "live-directory";
import { lookup } from "mime-types";
import { extname } from "path";
import APIError from "../../error/APIError.js";
import { StatusCodes } from "http-status-codes";

export default function CreateStatic(staticPath: string) {
	const StaticRouter = new Router();

	const LiveAssets = new LiveDirectory(process.env.STATIC_PATH || "./", {
		filter: {
			ignore: (path) => {
				const mime = lookup(extname(path));
				if (!mime) return true;
				return path.startsWith(".") || !mime.startsWith("image/");
			},
		},

		cache: {
			max_file_count: 250, // Files will only be cached up to 250 MB of memory usage
			max_file_size: 1024 * 1024, // All files under 1 MB will be cached
		},
	});

	process.on("SIGTERM", () => {
		LiveAssets.destory();
	});

	StaticRouter.get("/*", (req, res) => {
		const path = req.path.replace(staticPath, "");
		const file = LiveAssets.get(path);

		if (file === undefined) throw new APIError(StatusCodes.NOT_FOUND);

		const fileParts = file.path.split(".");
		const extension = fileParts[fileParts.length - 1];

		if (file.cached) {
			return res.type(extension).send(file.content);
		}
		return res.type(extension).stream(file.stream());
	});

	return StaticRouter;
}
