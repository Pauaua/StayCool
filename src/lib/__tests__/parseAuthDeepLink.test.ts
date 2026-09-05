import { parseAuthDeepLinkParams } from "@/lib/parseAuthDeepLink";

describe("parseAuthDeepLinkParams", () => {
  it("parsea params del fragment (#) que manda Supabase en los links de recovery", () => {
    const url = "agendacool://reset-password#access_token=abc123&refresh_token=xyz789&type=recovery";
    expect(parseAuthDeepLinkParams(url)).toEqual({
      access_token: "abc123",
      refresh_token: "xyz789",
      type: "recovery",
    });
  });

  it("también parsea query string (?) por si algún link viene así", () => {
    const url = "agendacool://reset-password?type=recovery&access_token=abc123";
    expect(parseAuthDeepLinkParams(url)).toEqual({
      type: "recovery",
      access_token: "abc123",
    });
  });

  it("decodifica valores URL-encoded", () => {
    const url = "agendacool://reset-password#email=a%40b.com";
    expect(parseAuthDeepLinkParams(url)).toEqual({ email: "a@b.com" });
  });

  it("devuelve objeto vacío si no hay fragment ni query", () => {
    expect(parseAuthDeepLinkParams("agendacool://reset-password")).toEqual({});
  });

  it("devuelve objeto vacío para un string vacío", () => {
    expect(parseAuthDeepLinkParams("")).toEqual({});
  });
});
