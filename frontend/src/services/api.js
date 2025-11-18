import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 20000
});

export async function fetchModels() {
  const { data } = await client.get("/recognition/models");
  return data;
}

export async function analyzeImage({ imageBase64, model }) {
  const { data } = await client.post("/recognition/analyze", { imageBase64, model });
  return data;
}

export default {
  fetchModels,
  analyzeImage
};