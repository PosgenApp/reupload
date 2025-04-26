import { ReasonPhrases, StatusCodes, getReasonPhrase } from "http-status-codes";
import GenericResponse from "../types/GenericResponse";

export default class APIError extends Error {
	httpResponseCode: number;
	httpResponseTitle: ReasonPhrases | string;

	constructor(code: StatusCodes, message?: string) {
		super(message);
		this.httpResponseCode = code;
		this.httpResponseTitle = getReasonPhrase(code);
	}

	get serialized(): APIErrorSchema {
		return {
			_ref: "error",
			error: this.httpResponseTitle,
			code: this.httpResponseCode,
			message: this.message,
		};
	}
}

export interface APIErrorSchema extends GenericResponse {
	error: ReasonPhrases | string;
	code: StatusCodes;
	message?: string;
}
