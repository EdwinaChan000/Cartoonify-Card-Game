import Knex from "knex";
import type { Knex as KnexType } from "knex";
import knexConfig from "../../knexfile";

import { ProfileService } from "../../services/ProfileService";

describe("ProfileService", () => {
  let knex: KnexType;
  let service: ProfileService;

  beforeAll(() => {
    knex = Knex(knexConfig["test"]);
  });

  beforeEach(async () => {
    service = new ProfileService(knex);
  });

  it("read profile - success", async () => {
    const sqlInfo = await service.getPersonalInfo(1);

    expect(sqlInfo[0].username).toEqual("Danny");
    expect(sqlInfo[0].email).toEqual("danny@email.com");
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
