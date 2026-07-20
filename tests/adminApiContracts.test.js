import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_API_CONTRACT_VERSION,
  validateAdminRequest,
} from "../src/contracts/adminApiContracts.js";

test("acepta un plan de mesas con ambas listas", () => {
  assert.equal(
    validateAdminRequest({
      confirmations: [],
      contractVersion: ADMIN_API_CONTRACT_VERSION,
      entity: "tablePlan",
      method: "PUT",
      tables: [],
    }),
    "",
  );
});

test("rechaza un plan de mesas incompleto", () => {
  assert.match(
    validateAdminRequest({
      contractVersion: ADMIN_API_CONTRACT_VERSION,
      entity: "tablePlan",
      method: "PUT",
      tables: [],
    }),
    /confirmaciones/,
  );
});
