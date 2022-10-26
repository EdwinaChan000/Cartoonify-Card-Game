import { ProfileService } from "../../services/ProfileService";
import { ProfileController } from "../../controllers/profileController";
import type { Request, Response } from "express";
import type { Knex } from "knex";

jest.mock("../../services/ProfileService");

describe("ProfileController", () => {
  let controller: ProfileController;
  let service: ProfileService;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    service = new ProfileService({} as Knex);
    service.getPersonalInfo = jest.fn(() =>
      Promise.resolve([
        {
          id: 2,
          username: "Edwina",
          email: "edwina@email.com",
          user_type: 888,
          avatar: "icon2.png",
          game_won: null,
          game_played: null,
        },
      ])
    );
    req = {
      params: {},
      query: {},
      body: {},
    } as Request;
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as any as Response;

    controller = new ProfileController(service);
  });

  it("getPersonalInfo -- failed", async () => {
    await controller.getPersonalInfo(req, res);

    expect(service.getPersonalInfo.call.length).toBe(1);
    expect(res.json).toBeCalledWith({
      message: "internal server error",
    });
  });
});
