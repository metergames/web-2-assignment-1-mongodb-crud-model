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

    // Add user
    response.write("--- ADD USER ---\n");

    // Valid inserts
    response.write(await handleAddUser("alex_w", "Alex", "alex.w@example.com", true));
    response.write("\n" + (await handleAddUser("maria_c", "Maria", "maria.c@example.com", true)));
    response.write("\n" + (await handleAddUser("liam_01", "Liam", "liam.01@example.com", false)));
    response.write("\n" + (await handleAddUser("sara_k", "Sara", "sara.k@example.com", true)));
    response.write("\n" + (await handleAddUser("noah_r", "Noah", "noah.r@example.com", true)));

    // Duplicate username
    response.write("\n" + (await handleAddUser("alex_w", "Alex", "alex2@example.com", true)));

    // Duplicate email
    response.write("\n" + (await handleAddUser("alex_new", "Alex", "alex.w@example.com", true)));

    // Duplicate username + email
    response.write("\n" + (await handleAddUser("maria_c", "Maria", "maria.c@example.com", true)));

    // Username too short
    response.write("\n" + (await handleAddUser("ab", "Abel", "abel@example.com", true)));

    // Username too long (21 chars)
    response.write("\n" + (await handleAddUser("this_username_is_21_c", "Taylor", "taylor@example.com", true)));

    // Username invalid characters
    response.write("\n" + (await handleAddUser("alex-w", "Alex", "alexw@example.com", true)));

    // Username all numbers (invalid: must contain a letter)
    response.write("\n" + (await handleAddUser("12345", "Num", "num@example.com", true)));

    // Username only underscores (invalid)
    response.write("\n" + (await handleAddUser("____", "Underscore", "u@example.com", true)));

    // First name invalid (non-letters)
    response.write("\n" + (await handleAddUser("sara_k", "Sara1", "sara.k@example.com", true)));

    // First name empty
    response.write("\n" + (await handleAddUser("noah_r", "", "noah.r@example.com", true)));

    // Invalid email
    response.write("\n" + (await handleAddUser("emma_t", "Emma", "not-an-email", true)));

    // Invalid isActive (forced wrong type)
    response.write("\n" + (await handleAddUser("oliver_d", "Oliver", "oliver.d@example.com", "true" as unknown as boolean)));

    // ==========

    // Get user
    response.write("\n\n--- GET USER ---\n");

    // Valid get (user exists)
    response.write(await handleGetUser("alex_w"));

    // Valid get (user exists)
    response.write("\n" + (await handleGetUser("maria_c")));

    // Get user that doesn't exist
    response.write("\n" + (await handleGetUser("nonexistent_user")));

    // Get user with invalid username format (too short)
    response.write("\n" + (await handleGetUser("ab")));

    // ==========

    // Get all users
    response.write("\n\n--- GET ALL USERS ---\n");

    // Get all users (display first 3)
    response.write(await handleGetAllUsers(3));

    // Get all users (display first 10)
    response.write("\n\n" + (await handleGetAllUsers(10)));

    // Get all users (display first 1)
    response.write("\n\n" + (await handleGetAllUsers(1)));

    // Get all users (display first 100 - more than exist)
    response.write("\n\n" + (await handleGetAllUsers(100)));

    // ==========

    // Update user
    response.write("\n\n--- UPDATE USER ---\n");

    // Valid update (change username)
    response.write(await handleUpdateUser("alex_w", "alex_williams", "Alex", "alex.w@example.com", true));

    // Valid update (change email)
    response.write("\n" + (await handleUpdateUser("maria_c", "maria_c", "Maria", "maria.santos@example.com", true)));

    // Valid update (change first name)
    response.write("\n" + (await handleUpdateUser("liam_01", "liam_01", "William", "liam.01@example.com", false)));

    // Valid update (change active status)
    response.write("\n" + (await handleUpdateUser("sara_k", "sara_k", "Sara", "sara.k@example.com", false)));

    // Update user that doesn't exist
    response.write("\n" + (await handleUpdateUser("nonexistent", "nonexistent_new", "Test", "test@example.com", true)));

    // Update to duplicate username
    response.write("\n" + (await handleUpdateUser("noah_r", "maria_c", "Noah", "noah.new@example.com", true)));

    // Update to duplicate email
    response.write("\n" + (await handleUpdateUser("noah_r", "noah_r", "Noah", "maria.santos@example.com", true)));

    // Update with invalid new username (too short)
    response.write("\n" + (await handleUpdateUser("noah_r", "ab", "Noah", "noah.r@example.com", true)));

    // Update with invalid new first name (contains numbers)
    response.write("\n" + (await handleUpdateUser("noah_r", "noah_r", "Noah1", "noah.r@example.com", true)));

    // Update with invalid new email
    response.write("\n" + (await handleUpdateUser("noah_r", "noah_r", "Noah", "not-an-email", true)));

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
        return `Successfully added user: ${userToAdd.username} - ${userToAdd.firstName} - ${userToAdd.email} - ${userToAdd.isActive ? "Active" : "Inactive"}`;
    } catch (error) {
        if (error instanceof InvalidInputError) return `Adding user failed - Invalid input - ${error.message}`;
        if (error instanceof DuplicateError) return `Adding user failed - Duplicate error - ${error.message}`;
        if (error instanceof DatabaseError) return `Adding user failed - Database error - ${error.message}`;
        return `Adding user failed - Unknown error - ${error}`;
    }
}

/**
 * Retrieves a user via the model and returns a status message.
 * @param username The username of the user to retrieve.
 * @returns A success or error message.
 */
async function handleGetUser(username: string): Promise<string> {
    try {
        const found: userModel.User = await userModel.getUser(username);
        return `Successfully found user: ${found.username} - ${found.firstName} - ${found.email} - ${found.isActive ? "Active" : "Inactive"}`;
    } catch (error) {
        if (error instanceof DatabaseError) return `Getting user failed - Database error - ${error.message}`;
        return `Getting user failed - Unknown error - ${error}`;
    }
}

/**
 * Retrieves all users via the model and returns a formatted status message.
 * @param limit The maximum number of users to display
 * @returns A formatted string containing the first x users, or an error message on failure.
 */
async function handleGetAllUsers(limit: number): Promise<string> {
    try {
        const userData: userModel.User[] = await userModel.getAllUsers();
        if (userData.length < limit) limit = userData.length;
        let built: string = `First ${limit == 1 ? "user" : `${limit} users`} (username - first name - email - active status)`;
        for (let userIndex = 0; userIndex < limit; userIndex++) {
            const currentUser: userModel.User | undefined = userData[userIndex];
            if (currentUser)
                built += `\n${currentUser.username} - ${currentUser.firstName} - ${currentUser.email} - ${currentUser.isActive ? "Active" : "Inactive"}`;
        }
        return built;
    } catch (error) {
        if (error instanceof DatabaseError) return `Getting users failed - Database error - ${error.message}`;
        return `Getting users failed - Unknown error - ${error}`;
    }
}

/**
 * Updates a user via the model and returns a status message.
 * @param username The original username of the user to update.
 * @param newUsername A new unique identifier for the user. Must be between 3 and 20 characters.
 * @param newFirstName The new first name (only letters accepted).
 * @param newEmail The new email address.
 * @param newIsActive The new active status of the user's account (true if active, false otherwise).
 * @returns A success or error message.
 */
async function handleUpdateUser(
    username: string,
    newUsername: string,
    newFirstName: string,
    newEmail: string,
    newIsActive: boolean,
): Promise<string> {
    try {
        const updatedUser: userModel.User = await userModel.updateUser(
            username,
            newUsername,
            newFirstName,
            newEmail,
            newIsActive,
        );
        return `Successfully updated user ${username}: ${updatedUser.username} - ${updatedUser.firstName} - ${updatedUser.email} - ${updatedUser.isActive ? "Active" : "Inactive"}`;
    } catch (error) {
        if (error instanceof InvalidInputError) return `Updating user failed - Invalid input - ${error.message}`;
        if (error instanceof DuplicateError) return `Updating user failed - Duplicate error - ${error.message}`;
        if (error instanceof DatabaseError) return `Updating user failed - Database error - ${error.message}`;
        return `Updating user failed - Unknown error - ${error}`;
    }
}
