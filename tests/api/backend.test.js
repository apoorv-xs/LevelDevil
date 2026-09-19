import { beforeEach, describe, expect, it } from "vitest";
import { resetStore, repos } from "../../api/src/store.js";
import { publicInquiry, ownerInvitation, redeem, aiQualification } from "../../api/src/handlers.js";

const req = (body, token) => ({ body, headers: token ? { authorization: `Bearer ${token}` } : {} });
const context = { error() {} };

beforeEach(() => { resetStore(); process.env.AI_MODE = "mock"; });

describe("managed API", () => {
  it("validates and stores a public inquiry", async () => {
    const result = await publicInquiry(req({ name: "Ada", email: "ada@example.com", message: "Hello" }), context);
    expect(result.status).toBe(201);
    expect(repos.inquiries.list()).toHaveLength(1);
  });
  it("rejects owner endpoints without the owner role", async () => {
    await expect(ownerInvitation(req({ email: "rep@example.com", role: "sales_rep" }, "mock:rep:sales_rep"), context)).rejects.toMatchObject({ status: 403 });
  });
  it("redeems an invitation only once", async () => {
    const created = await ownerInvitation(req({ email: "rep@example.com", role: "sales_rep" }, "mock:owner:owner"), context);
    const token = JSON.parse(created.body).data.token;
    await redeem(req({ token }, "mock:rep:sales_rep"), context);
    await expect(redeem(req({ token }, "mock:other:sales_rep"), context)).rejects.toMatchObject({ status: 409 });
  });
  it("supports explicit synthetic AI mode", async () => {
    const result = await aiQualification(req({ message: "Interested" }, "mock:rep:sales_rep"), context);
    expect(JSON.parse(result.body).data.category).toBe("warm");
  });
});
