const REQUIRED_METHODS = ["get", "post", "put", "patch", "delete"];

const createUserService = (adapter) => {
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter?.[method] !== "function") {
      throw new Error(`Adapter must implement the "${method}" method`);
    }
  }

  return {
    getUsers: async (page = 1) => {
      const response = await adapter.get(`/users?page=${page}`);
      return response.data;
    },

    getUserById: async (id) => {
      const response = await adapter.get(`/users/${id}`);
      return response.data;
    },

    createUser: async (user) => {
      return await adapter.post("/users", user);
    },

    updateUser: async (id, user) => {
      return await adapter.put(`/users/${id}`, user);
    },

    patchUser: async (id, user) => {
      return await adapter.patch(`/users/${id}`, user);
    },

    deleteUser: async (id) => {
      return await adapter.delete(`/users/${id}`);
    },
  };
};

export default createUserService;