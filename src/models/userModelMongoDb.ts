import { MongoError, Db, MongoClient, Collection } from "mongodb";
import { isValidUserData } from "./validateUtils.js";
import { DatabaseError } from "./DatabaseError.js";

const USERS_COLLECTION = "users";

interface User {
    username: string;
    firstName: string;
    email: string;
    isActive: boolean;
}

let client: MongoClient;
let usersCollection: Collection<User> | undefined;

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

export { initialize };
export type { User };
