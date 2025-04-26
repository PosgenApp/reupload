import "dotenv/config";

import { Server } from "hyper-express";
import ImageRouter from "./routes/image/index.js";
import APIError, { APIErrorSchema } from "./error/APIError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import CreateStatic from "./routes/static/index.js";

const staticServing = process.env.STATIC?.toString().toLowerCase() === "true";

if (!process.env.TEMP_PATH || (!process.env.STATIC_PATH && staticServing))
	throw new Error("Environment variables must be defined!");

const PORT = +(process.env.PORT || "3000");

const app = new Server({
	max_body_length: +(process.env.MAX_BODY_SIZE || "4194304"),
});

app.use("/image", ImageRouter);
if (staticServing) app.use("/static", CreateStatic("/static"));

// error fallback
app.set_error_handler((req, res, error) => {
	if (error instanceof APIError) {
		res.status(error.httpResponseCode).json(error.serialized);
		return;
	}
	console.error(error);
	res.status(500).json({
		_ref: "error",
		code: StatusCodes.INTERNAL_SERVER_ERROR,
		error: ReasonPhrases.INTERNAL_SERVER_ERROR,
	} as APIErrorSchema);
});

// 404 fallback
app.set_not_found_handler((req, res) => {
	res.status(404).json({
		_ref: "error",
		code: StatusCodes.NOT_FOUND,
		error: ReasonPhrases.NOT_FOUND,
	} as APIErrorSchema);
	return;
});

app
	.listen(PORT, () => {
		console.log(`✨ Server is listening on port ${PORT}`);
	})
	.catch((reason) => {
		console.error(
			`😭 While trying to listen port ${PORT} some unexpected error happend.`
		);
		console.error(reason);
	});
