import { test } from "node:test";
import assert from "node:assert/strict";
import { linkedInCertificationUrl } from "../../components/features/campus/certificate/format.ts";

const base = {
  name: "Fundamentos de la misión",
  verifyUrl: "https://hopeaviation.org/certificados/HA-BBD0C19F58",
  code: "HA-BBD0C19F58",
};

test("prefills LinkedIn's add-certification form", () => {
  const url = new URL(linkedInCertificationUrl({ ...base, issuedAt: "2026-11-06T15:00:00Z" }));
  assert.equal(url.origin + url.pathname, "https://www.linkedin.com/profile/add");
  assert.equal(url.searchParams.get("startTask"), "CERTIFICATION_NAME");
  assert.equal(url.searchParams.get("name"), "Fundamentos de la misión");
  assert.equal(url.searchParams.get("organizationName"), "Hope Aviation");
  assert.equal(url.searchParams.get("issueYear"), "2026");
  assert.equal(url.searchParams.get("issueMonth"), "11");
  assert.equal(url.searchParams.get("certUrl"), base.verifyUrl);
  assert.equal(url.searchParams.get("certId"), base.code);
});

test("uses the Buenos Aires month, like the printed date", () => {
  // 02:00 UTC on Nov 1 is still Oct 31 in Argentina (UTC-3).
  const url = new URL(linkedInCertificationUrl({ ...base, issuedAt: "2026-11-01T02:00:00Z" }));
  assert.equal(url.searchParams.get("issueYear"), "2026");
  assert.equal(url.searchParams.get("issueMonth"), "10");
});

test("leaves the date out when it can't be read", () => {
  const url = new URL(linkedInCertificationUrl({ ...base, issuedAt: "not a date" }));
  assert.equal(url.searchParams.get("issueYear"), null);
  assert.equal(url.searchParams.get("issueMonth"), null);
  assert.equal(url.searchParams.get("certId"), base.code);
});
