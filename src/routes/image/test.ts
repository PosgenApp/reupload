import { Request, Response } from "hyper-express";

export default async function (req: Request, res: Response) {
	console.log(req.path);
	console.log(req.url);
	console.log(req.baseUrl);
	console.log(req.originalUrl);

	res.json({ _ref: "ok" });
}
