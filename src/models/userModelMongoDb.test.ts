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

test("Add valid user", async () => {
    const newUser: userModel.User = generateUserData()!;
    await userModel.addUser(newUser.username, newUser.firstName, newUser.email, newUser.isActive);
    const results = await userModel.getCollection().find().toArray();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0]?.username).toBe(newUser.username);
    expect(results[0]?.firstName).toBe(newUser.firstName);
    expect(results[0]?.email).toBe(newUser.email);
    expect(results[0]?.isActive).toBe(newUser.isActive);
});

test("Throw error for duplicate username", async () => {
    const newUser: userModel.User = generateUserData()!;
    await userModel.addUser(newUser.username, newUser.firstName, newUser.email, newUser.isActive);
    const secondUser: userModel.User = generateUserData()!;
    await expect(
        userModel.addUser(newUser.username, secondUser.firstName, secondUser.email, secondUser.isActive),
    ).rejects.toThrow();
});

test("Throw error for duplicate email", async () => {
    const newUser: userModel.User = generateUserData()!;
    await userModel.addUser(newUser.username, newUser.firstName, newUser.email, newUser.isActive);
    const secondUser: userModel.User = generateUserData()!;
    await expect(
        userModel.addUser(secondUser.username, secondUser.firstName, newUser.email, secondUser.isActive),
    ).rejects.toThrow();
});

test("Throw error for duplicate username and email", async () => {
    const newUser: userModel.User = generateUserData()!;
    await userModel.addUser(newUser.username, newUser.firstName, newUser.email, newUser.isActive);
    const secondUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser(newUser.username, secondUser.firstName, newUser.email, secondUser.isActive)).rejects.toThrow();
});

test("Throw error for invalid username (under 3 characters)", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser("ad", newUser.firstName, newUser.email, newUser.isActive)).rejects.toThrow();
});

test("Throw error for invalid username (over 20 characters)", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(
        userModel.addUser("this_username_is_over_20", newUser.firstName, newUser.email, newUser.isActive),
    ).rejects.toThrow();
});

test("Throw error for invalid username (special characters)", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser("alex-w", newUser.firstName, newUser.email, newUser.isActive)).rejects.toThrow();
});

test("Throw error for invalid username (only numbers or underscores)", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser("12345", newUser.firstName, newUser.email, newUser.isActive)).rejects.toThrow();
    const secondUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser("_____", secondUser.firstName, secondUser.email, secondUser.isActive)).rejects.toThrow();
    const thirdUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser("1_2_3_4", thirdUser.firstName, thirdUser.email, thirdUser.isActive)).rejects.toThrow();
});

test("Throw error for invalid first name (contains numbers)", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser(newUser.username, `${newUser.firstName}2`, newUser.email, newUser.isActive)).rejects.toThrow();
});

test("Throw error for empty first name", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser(newUser.username, "", newUser.email, newUser.isActive)).rejects.toThrow();
});

test("Throw error for invalid email", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.addUser(newUser.username, newUser.firstName, "not-an-email", newUser.isActive)).rejects.toThrow();
    const secondUser: userModel.User = generateUserData()!;
    await expect(
        userModel.addUser(secondUser.username, secondUser.firstName, "email@example", secondUser.isActive),
    ).rejects.toThrow();
});

test("Throw error for invalid active status", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(
        userModel.addUser(newUser.username, newUser.firstName, newUser.email, "true" as unknown as boolean),
    ).rejects.toThrow();
});

test("Retrieve existing user", async () => {
    const newUser: userModel.User = generateUserData()!;
    await userModel.addUser(newUser.username, newUser.firstName, newUser.email, newUser.isActive);
    const foundUser: userModel.User = await userModel.getUser(newUser.username);

    expect(foundUser.username).toBe(newUser.username);
    expect(foundUser.firstName).toBe(newUser.firstName);
    expect(foundUser.email).toBe(newUser.email);
    expect(foundUser.isActive).toBe(newUser.isActive);
});

test("Throw error for non-existent user", async () => {
    const newUser: userModel.User = generateUserData()!;
    await expect(userModel.getUser(newUser.username)).rejects.toThrow();
});
