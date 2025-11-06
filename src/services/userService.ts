import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function getUserData(): Promise<User> {
  const response = await api.get<User>("/user");
  return response.data;
}
