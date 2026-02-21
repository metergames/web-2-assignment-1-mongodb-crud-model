import { MongoError, Db, MongoClient, Collection, type UpdateResult } from "mongodb";
import { isValidUserData } from "./validateUtils.js";
import { DatabaseError } from "./DatabaseError.js";
import { DuplicateError } from "./DuplicateError.js";

const USERS_COLLECTION = "users";

interface User {
    username: string;
    firstName: string;
    email: string;
    isActive: boolean;
}

let client: MongoClient;
let usersCollection: Collection<User> | undefined;

/**
 * Initializes the MongoDB client and ensures the users collection exists.
 * @param dbFilename Name of the database to connect to.
 * @param resetFlag If true, drops the users collection when it exists.
 * @param url MongoDB connection string.
 */
async function initialize(dbFilename: string, resetFlag: boolean, url: string): Promise<void> {
    try {
        client = new MongoClient(url);
        await client.connect();
        console.log("Connected to MongoDb");
        const db: Db = client.db(dbFilename);

        let collectionCursor = db.listCollections({ name: USERS_COLLECTION });
        let collectionArray = await collectionCursor.toArray();

        if (resetFlag && collectionArray.length > 0) await db.collection(USERS_COLLECTION).drop();

        if (collectionArray.length == 0) {
            const collation = { locale: "en", strength: 1 };
            await db.createCollection(USERS_COLLECTION, { collation: collation });
        }

        usersCollection = db.collection<User>(USERS_COLLECTION);
    } catch (error) {
        if (error instanceof MongoError) console.error(`MongoDB connection failed: ${error.message}`);
        else {
            console.error(`Unexpected error: ${error}`);
            throw new DatabaseError(`Unexpected error: ${error}`);
        }
    }
}

/**
 * Adds a new user to the users collection after validating input and user uniqueness.
 * @param username A unique identifier for the user. Must be between 3 and 20 characters.
 * @param firstName The user's name (only letters accepted).
 * @param email The user's email address.
 * @param isActive The active status of the user's account (true if active, false otherwise).
 * @returns The user object that was inserted.
 */
async function addUser(username: string, firstName: string, email: string, isActive: boolean): Promise<User> {
    isValidUserData(username, firstName, email, isActive);

    if (!usersCollection) throw new DatabaseError("Collection not initialized");

    const existingUser = await usersCollection.findOne({ $or: [{ username: username }, { email: email }] });
    if (existingUser) {
        if (existingUser.username === username && existingUser.email === email)
            throw new DuplicateError("Both this email and username are already in use");
        else if (existingUser.username === username) throw new DuplicateError("This username is already taken");
        else if (existingUser.email === email) throw new DuplicateError("A user with this email already exists");
    }

    try {
        const userToAdd: User = { username: username, firstName: firstName, email: email, isActive: isActive };
        console.log(`Inserted user ${(await usersCollection.insertOne(userToAdd)).insertedId}`);
        return userToAdd;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Unexpected error: ${error.message}`);
            throw new DatabaseError(`Unexpected error: ${error.message}`);
        }

        throw new DatabaseError(`Unexpected error - Unknown error: ${error}`);
    }
}

/**
 * Retrieves a user from the users collection by username.
 * @param username The username of the user to retrieve.
 * @returns The user object matching the username, if found.
 */
async function getUser(username: string): Promise<User> {
    if (!usersCollection) throw new DatabaseError("Collection not initialized");

    try {
        const found: User | null = await usersCollection.findOne<User>({ username: username });
        if (!found) throw new DatabaseError(`Couldn't find user ${username}`);
        return found;
    } catch (error) {
        if (error instanceof DatabaseError) throw new DatabaseError(error.message);
        if (error instanceof Error) {
            console.error(`Unexpected error: ${error.message}`);
            throw new DatabaseError(`Unexpected error: ${error.message}`);
        }
        throw new DatabaseError(`Unexpected error - Unknown error: ${error}`);
    }
}

/**
 * Retrieves all users from the users collection.
 * @returns An array of all user objects in the collection.
 */
async function getAllUsers(): Promise<User[]> {
    if (!usersCollection) throw new DatabaseError("Collection not initialized");

    try {
        return await await usersCollection.find<User>({}).toArray();
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Unexpected error: ${error.message}`);
            throw new DatabaseError(`Unexpected error: ${error.message}`);
        }
        throw new DatabaseError(`Unexpected error - Unknown error: ${error}`);
    }
}

/**
 * Updates an existing user in the users collection after validating new input and checking for duplicates.
 * @param username The original username of the user to update.
 * @param newUsername A new unique identifier for the user. Must be between 3 and 20 characters.
 * @param newFirstName The new first name (only letters accepted).
 * @param newEmail The new email address.
 * @param newIsActive The new active status of the user's account (true if active, false otherwise).
 * @returns The updated user object.
 */
async function updateUser(
    username: string,
    newUsername: string,
    newFirstName: string,
    newEmail: string,
    newIsActive: boolean,
): Promise<User> {
    isValidUserData(newUsername, newFirstName, newEmail, newIsActive);

    if (!usersCollection) throw new DatabaseError("Collection not initialized");

    const existingUser = await usersCollection.findOne({
        $and: [{ $or: [{ username: newUsername }, { email: newEmail }] }, { username: { $ne: username } }],
    });
    if (existingUser) {
        if (existingUser.username === newUsername && existingUser.email === newEmail)
            throw new DuplicateError("Both this email and username are already in use");
        else if (existingUser.username === newUsername) throw new DuplicateError("This username is already taken");
        else if (existingUser.email === newEmail) throw new DuplicateError("A user with this email already exists");
    }

    try {
        const result: UpdateResult = await usersCollection.updateOne(
            { username: username },
            { $set: { username: newUsername, firstName: newFirstName, email: newEmail, isActive: newIsActive } },
        );
        if (result.matchedCount === 0) throw new DatabaseError(`Couldn't find user ${username} to update`);
        console.log(`Updated user ${username}`);
        return { username: newUsername, firstName: newFirstName, email: newEmail, isActive: newIsActive };
    } catch (error) {
        if (error instanceof DatabaseError) throw new DatabaseError(error.message);
        if (error instanceof Error) {
            console.error(`Unexpected error: ${error.message}`);
            throw new DatabaseError(`Unexpected error: ${error.message}`);
        }
        throw new DatabaseError(`Unexpected error - Unknown error: ${error}`);
    }
}

export { initialize, addUser, getUser, getAllUsers, updateUser };
export type { User };
