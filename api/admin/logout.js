import { clearAdminSession } from "../_adminAuth.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }

  clearAdminSession(response);
  response.status(204).end();
}

