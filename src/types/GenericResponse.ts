type Reference = "error" | "array" | "object" | "string" | "number";

export default interface GenericResponse {
	_ref: Reference;
}
