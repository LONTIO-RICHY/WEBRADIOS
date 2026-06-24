import api from "../api";

export const tester = async () => {
  const res = await api.get("/");
  console.log(res.data); // { message: "OK" }
};