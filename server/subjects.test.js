const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("./app");
const User = require("./models/User");
const Subject = require("./models/Subject");
const jwt = require("jsonwebtoken");

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const mockUser = {
    userId: new mongoose.Types.ObjectId().toString(),
    username: "testUser",
    email: "test@example.com",
};

beforeEach(async () => {
    await User.deleteMany({});
    await Subject.deleteMany({});

    mockUser.validToken = jwt.sign({ userId: mockUser.userId }, process.env.JWT_SECRET || "test_secret");
    
    // Note: User model might have different fields, 
    // but the controller uses req.user.userId from decoded JWT.
});

const mockSubjects = [
    {
        userId: mockUser.userId,
        subjectName: "Math",
        difficulty: 3,
        proficiency: 2,
        syllabusRemaining: 50,
        examDate: new Date()
    },
    {
        userId: mockUser.userId,
        subjectName: "Science",
        difficulty: 4,
        proficiency: 3,
        syllabusRemaining: 30,
        examDate: new Date()
    }
];

beforeEach(async () => {
    await Subject.insertMany(mockSubjects);
});

test("GET all subjects for user should succeed", async () => {
    const result = await request(app)
        .get("/api/subjects")
        .set("Authorization", "Bearer " + mockUser.validToken);

    expect(result.status).toBe(200);   
    expect(result.body).toBeInstanceOf(Array);
    expect(result.body.length).toBe(2);
    expect(result.body[0].subjectName).toBe("Math");
});

test("POST valid subject should succeed", async () => {
    const result = await request(app)
        .post("/api/subjects")
        .set("Authorization", "Bearer " + mockUser.validToken)
        .send({
            subjectName: "History",
            difficulty: 2,
            proficiency: 4,
            syllabusRemaining: 10,
            examDate: "2024-12-31"
        });

    expect(result.status).toBe(201);   
    expect(result.body.subjectName).toBe("History");
});

test("POST without subjectName should fail", async () => {
    const result = await request(app)
        .post("/api/subjects")
        .set("Authorization", "Bearer " + mockUser.validToken)
        .send({
            difficulty: 2,
            proficiency: 4,
            syllabusRemaining: 10,
            examDate: "2024-12-31"
        });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe("subjectName is required");
});

test("GET subjects without token should fail", async () => {
    const result = await request(app)
        .get("/api/subjects");

    expect(result.status).toBe(401);
});
