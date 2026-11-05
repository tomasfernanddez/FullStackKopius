import fetchAdapter from "./adapters/http/fetch.adapter.js";
import axiosAdapter from "./adapters/http/axios.adapter.js";
import fakeAdapter from "./adapters/http/fake.adapter.js";

import createUserService from "./services/user.service.js";

const userService = createUserService(fakeAdapter);

const run = async (label, operation) => {
  try {
    const result = await operation();
    console.log(`[OK] ${label}:`, result);
  } catch (error) {
    console.error(`[ERROR] ${label}:`, error.message);
  } finally {
    console.log(`${label} finished\n`);
  }
};

const main = async () => {
  await run("getUsers", () => userService.getUsers(1));
  await run("getUserById", () => userService.getUserById(2));
  await run("createUser", () => userService.createUser({ name: "Tomás", job: "Developer" }));
  await run("updateUser", () => userService.updateUser(2, { name: "Tomás", job: "Full Stack Developer" }));
  await run("patchUser", () => userService.patchUser(2, { job: "Backend Developer" }));
  await run("deleteUser", () => userService.deleteUser(2));

  await run("getUserById (not found)", () => userService.getUserById(9999));
};

main();