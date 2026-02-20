import validator from "validator";
import { DuplicateError } from "./DuplicateError.js";
import { InvalidInputError } from "./InvalidInputError.js";

const MINIMUM_USERNAME_LENGTH = 3;
const MAXIMUM_USERNAME_LENGTH = 20;

/**
 * Validates the format of user data for all fields.
 * @param username A unique identifier for the user. Must be between 3 and 20 characters.
 * @param firstName The user's name (only letters accepted).
 * @param email The user's email address.
 * @param isActive The active status of the user's account (true if active, false otherwise).
 * @returns True if username, first name, email and active status are valid.
 */
function isValidUserData(username: string, firstName: string, email: string, isActive: boolean) {
    if (!username || !validator.isAlphanumeric(username)) {
        throw new InvalidInputError("Invalid username");
    } else {
        const usernameLength: number = username.length;
        if (usernameLength < MINIMUM_USERNAME_LENGTH || usernameLength > MAXIMUM_USERNAME_LENGTH) {
            throw new InvalidInputError(
                `Username must be between ${MINIMUM_USERNAME_LENGTH} and ${MAXIMUM_USERNAME_LENGTH} characters`,
            );
        }
    }

    if (!firstName || !validator.isAlpha(firstName)) throw new InvalidInputError("Invalid first name");

    if (!email || !validator.isEmail(email)) throw new InvalidInputError("Invalid email");

    if (typeof isActive !== "boolean") throw new InvalidInputError("Invalid active status");

    return true;
}

export { isValidUserData };
