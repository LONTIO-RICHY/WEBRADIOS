import api from "../api";

const tester = async () => {
  const res = await api.get("/");
  console.log(res.data); // { message: "OK" }
};