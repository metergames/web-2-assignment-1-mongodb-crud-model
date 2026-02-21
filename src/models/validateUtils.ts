import validator from "validator";
import { InvalidInputError } from "./InvalidInputError.js";

const MINIMUM_USERNAME_LENGTH = 3;
const MAXIMUM_USERNAME_LENGTH = 20;

/**
 * Validates the format of user data for all fields.
 * @param username A unique identifier for the user. Must be between 3 and 20 characters.
 *                 Allows letters, numbers and underscores, must have minimum of 1 letter.
 * @param firstName The user's name (only letters accepted).
 * @param email The user's email address.
 * @param isActive The active status of the user's account (true if active, false otherwise).
 * @returns True if username, first name, email and active status are valid.
 */
function isValidUserData(username: string, firstName: string, email: string, isActive: boolean) {
    // Username
    if (!username) throw new InvalidInputError("Invalid username");

    if (!validator.isLength(username, { min: MINIMUM_USERNAME_LENGTH, max: MAXIMUM_USERNAME_LENGTH }))
        throw new InvalidInputError(
            `Username must be between ${MINIMUM_USERNAME_LENGTH} and ${MAXIMUM_USERNAME_LENGTH} characters`,
        );

    // a-z, A-Z, 0-9, _
    if (!validator.matches(username, /^[a-zA-Z0-9_]+$/))
        throw new InvalidInputError("Invalid username - must only contain letters, numbers or underscores");

    const noUnderscoresUsername = username.replaceAll("_", "");
    if (validator.isNumeric(noUnderscoresUsername) || noUnderscoresUsername === "")
        throw new InvalidInputError("Invalid username - Username must contain at least one letter");

    // First name
    if (!firstName || !validator.isAlpha(firstName)) throw new InvalidInputError("Invalid first name");

    // Email
    if (!email || !validator.isEmail(email)) throw new InvalidInputError("Invalid email");

    // Active status
    if (typeof isActive !== "boolean") throw new InvalidInputError("Invalid active status");

    return true;
}

export { isValidUserData };
