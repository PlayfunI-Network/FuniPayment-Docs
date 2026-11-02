import { describe, expect, test } from "vitest";
import { EXTERNAL_LINK_PROPS, isExternalHref } from "./external-link";

describe("isExternalHref", () => {
  test.each(["https://dashboard.funipay.net", "https://funipay.net/terms", "http://example.com", "HTTPS://go.funipay.net/install"])(
    "%s is external",
    (href) => expect(isExternalHref(href)).toBe(true),
  );
  test.each(["/getting-started/login", "#steps", "./login", "mailto:contact@funipay.net", "", undefined])(
    "%s is not external",
    (href) => expect(isExternalHref(href)).toBe(false),
  );
  test("opens in a new tab without leaking the opener", () => {
    expect(EXTERNAL_LINK_PROPS).toEqual({ target: "_blank", rel: "noopener noreferrer" });
  });
});
