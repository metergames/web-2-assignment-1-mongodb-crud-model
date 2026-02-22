import * as userModel from "./userModelMongoDb.js";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongodbServer: MongoMemoryServer;
const DB_NAME: string = "web-2-assignment-1-growth-mindset-test";

jest.setTimeout(5000);

const userData: userModel.User[] = [
    { username: "alex_w", firstName: "Alex", email: "alex.w@example.com", isActive: true },
    { username: "maria_c", firstName: "Maria", email: "maria.c@example.com", isActive: true },
    { username: "liam_b", firstName: "Liam", email: "liam.b@example.com", isActive: true },
    { username: "sara_k", firstName: "Sara", email: "sara.k@example.com", isActive: true },
    { username: "noah_r", firstName: "Noah", email: "noah.r@example.com", isActive: true },
    { username: "emma_t", firstName: "Emma", email: "emma.t@example.com", isActive: true },
    { username: "oliver_d", firstName: "Oliver", email: "oliver.d@example.com", isActive: true },
    { username: "ava_m", firstName: "Ava", email: "ava.m@example.com", isActive: true },
    { username: "elijah_p", firstName: "Elijah", email: "elijah.p@example.com", isActive: true },
    { username: "mia_s", firstName: "Mia", email: "mia.s@example.com", isActive: true },
    { username: "lucas_h", firstName: "Lucas", email: "lucas.h@example.com", isActive: true },
    { username: "dylan_f", firstName: "Dylan", email: "dylan.f@example.com", isActive: false },
    { username: "amelia_f", firstName: "Amelia", email: "amelia.f@example.com", isActive: true },
    { username: "james_g", firstName: "James", email: "james.g@example.com", isActive: true },
    { username: "harper_l", firstName: "Harper", email: "harper.l@example.com", isActive: true },
    { username: "benjamin_j", firstName: "Benjamin", email: "benjamin.j@example.com", isActive: true },
    { username: "evelyn_n", firstName: "Evelyn", email: "evelyn.n@example.com", isActive: true },
    { username: "henry_q", firstName: "Henry", email: "henry.q@example.com", isActive: true },
    { username: "abigail_v", firstName: "Abigail", email: "abigail.v@example.com", isActive: true },
    { username: "jack_u", firstName: "Jack", email: "jack.u@example.com", isActive: true },
    { username: "sofia_y", firstName: "Sofia", email: "sofia.y@example.com", isActive: true },
    { username: "logan_z", firstName: "Logan", email: "logan.z@example.com", isActive: true },
    { username: "grace_a", firstName: "Grace", email: "grace.a@example.com", isActive: true },
    { username: "sebastian_e", firstName: "Sebastian", email: "sebastian.e@example.com", isActive: true },
    { username: "chloe_i", firstName: "Chloe", email: "chloe.i@example.com", isActive: true },
    { username: "wyatt_o", firstName: "Wyatt", email: "wyatt.o@example.com", isActive: true },
    { username: "lily_b", firstName: "Lily", email: "lily.b@example.com", isActive: true },
    { username: "nathan_c", firstName: "Nathan", email: "nathan.c@example.com", isActive: true },
    { username: "zoe_d", firstName: "Zoe", email: "zoe.d@example.com", isActive: true },
    { username: "ivy_g", firstName: "Ivy", email: "ivy.g@example.com", isActive: false },
];

const generateUserData = () => userData.splice(Math.floor(Math.random() * userData.length), 1)[0];

beforeAll(async () => {
    mongodbServer = await MongoMemoryServer.create();
    console.log("Mock database started");
});

afterAll(async () => {
    await mongodbServer.stop();
    console.log("Mock database stopped");
});

beforeEach(async () => {
    try {
        const URL: string = mongodbServer.getUri();
        await userModel.initialize(DB_NAME, true, URL);
    } catch (error: unknown) {
        if (error instanceof Error) console.error(error.message);
        else console.error(`Unknown error occurred: ${error}`);
    }
});

afterEach(async () => {
    await userModel.close();
});
