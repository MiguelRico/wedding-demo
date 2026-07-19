import { isValidAdminPassword, setAdminSession } from "../_adminAuth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }

  if (!isValidAdminPassword(request.body?.password)) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  setAdminSession(response);
  response.status(204).end();
}

