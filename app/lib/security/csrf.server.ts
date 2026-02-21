import { createCookie } from "react-router";
import { CSRF, CSRFError } from "remix-utils/csrf/server";

// ### CSRF Protection
// CSRF attacks transform a users post request into a get request, which is not protected by the SameSite cookie attribute. If the get endpoint is mutating data, which you should never do, then this can lead to data manipulation by attackers.
// You have to call validateCSRF() in every action function in your app and include <AuthenticityTokenInput /> (remix-utils) in your html forms. TODO: Point to form action example when it's ready.

const cookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: process.env.CSRF_SECRETS,
});

export const csrf = new CSRF({ cookie });

export async function validateCSRF(formData: FormData, headers: Headers) {
  try {
    await csrf.validate(formData, headers);
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }
    throw error;
  }
}
