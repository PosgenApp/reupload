import { Router } from "hyper-express";
import Read from "./read";
import Create from "./create";
import Delete from "./delete";
import test from "./test";

const ImageRouter = new Router();

ImageRouter.get("/get/:id", Read);
ImageRouter.post("/create", Create);
ImageRouter.delete("/delete/:id", Delete);
ImageRouter.get("/test/*", test);

export default ImageRouter;
