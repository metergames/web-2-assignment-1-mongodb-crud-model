import { createServer, IncomingMessage, ServerResponse } from "http";
import * as userModel from "./models/userModelMongoDb.js";
import { InvalidInputError } from "./models/InvalidInputError.js";
import { DuplicateError } from "./models/DuplicateError.js";
import { DatabaseError } from "./models/DatabaseError.js";

const PORT: number = 1339;
const DB_NAME: string = "web-2-assignment-1-growth-mindset";
const url = process.env.URL_PRE! + process.env.MONGODB_PWD! + process.env.URL_POST!;
let initialized = userModel.initialize(DB_NAME, false, url);

createServer(async function (request: IncomingMessage, response: ServerResponse): Promise<void> {
    await initialized;
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write(await handleAddUser("alex_w", "Alex", "alex.w@example.com", true));
    response.end("\n\nEnded program");
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

/**
 * Adds a user via the model and returns a status message.
 * @param username A unique identifier for the user. Must be between 3 and 20 characters.
 * @param firstName The user's name (only letters accepted).
 * @param email The user's email address.
 * @param isActive The active status of the user's account (true if active, false otherwise).
 * @returns A success or error message.
 */
async function handleAddUser(username: string, firstName: string, email: string, isActive: boolean): Promise<string> {
    try {
        const userToAdd: userModel.User = await userModel.addUser(username, firstName, email, isActive);
        return `Successfully added user: ${userToAdd.username} - ${userToAdd.firstName} - ${userToAdd.email} - ${isActive ? "Active" : "Inactive"}`;
    } catch (error) {
        if (error instanceof InvalidInputError) return `Adding pokemon failed - Invalid input - ${error.message}`;
        if (error instanceof DuplicateError) return `Adding pokemon failed - Duplicate error - ${error.message}`;
        if (error instanceof DatabaseError) return `Adding pokemon failed - Database error - ${error.message}`;
        return `Adding pokemon failed - Unknown error - ${error}`;
    }
}
