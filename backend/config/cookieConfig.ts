import { CookieOptions } from "express";

export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 saat
  path: "/",
};
