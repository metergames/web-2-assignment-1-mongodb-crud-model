import { createServer, IncomingMessage, ServerResponse } from "http";
import * as userModel from "./models/userModelMongoDb.js";

const PORT: number = 1339;
const DB_NAME: string = "web-2-assignment-1-growth-mindset";
const url = process.env.URL_PRE! + process.env.MONGODB_PWD! + process.env.URL_POST!;
let initialized = userModel.initialize(DB_NAME, false, url);

createServer(async function (request: IncomingMessage, response: ServerResponse): Promise<void> {
    await initialized;
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Ended program");
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
