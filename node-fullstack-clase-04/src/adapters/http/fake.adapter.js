const fakeUser = {
  id: 2,
  email: "fake@example.com",
  first_name: "Fake",
  last_name: "User",
  avatar: "",
};

const fakeAdapter = {
  get: async (path) => {
    if (path.startsWith("/users?")) {
      return { data: [fakeUser] };
    }
    return { data: fakeUser };
  },
  post: async (path, body) => ({ ...body, id: "fake-1", createdAt: new Date().toISOString() }),
  put: async (path, body) => ({ ...body, updatedAt: new Date().toISOString() }),
  patch: async (path, body) => ({ ...body, updatedAt: new Date().toISOString() }),
  delete: async () => null,
};

export default fakeAdapter;