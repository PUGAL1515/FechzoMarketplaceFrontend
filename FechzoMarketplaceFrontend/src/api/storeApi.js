import api from "./axios";

export const getStores = async (params = {}) => {
  const response = await api.get("/stores", {
    params
  });

  return response.data;
};

export const getStoreById = async (id) => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};