import { it, describe, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

// je décris sur quel endpoint je tape
describe("GET /trips/28", () => {
  // on décrit ensuite ce qu'on teste
  it("responds with the correct JSON data", async () => {
    const response = await request(app)
      .get("/trips/28")
      .expect("Content-Type", "application/json; charset=utf-8");

    expect("id" in response.body, "id is in response").toEqual(true);
    expect("prompt" in response.body, "prompt is in the response").toEqual(
      true
    );
    expect(
      "isResponse" in response.body,
      "isResponse is in the response"
    ).toEqual(true);
  });
});

// je décris sur quel endpoint je tape
describe("Get /trips/28", () => {
  //on décrit ensuite ce qu'on teste
  it("return a 404 if trips doest not exist", () => {
    return request(app)
      .get("/trips/28")
      .expect(content - Type, "application/json; charset=utf-8")
      .expect(404);
  });
});
