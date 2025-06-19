import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { Admin } from "../models/admin";
import bcrypt from "bcryptjs";
import { cookieConfig } from "../config/cookieConfig";
import { v4 as uuidv4 } from "uuid";

// Basit session store (memory, production için uygun değil)
const sessions: Record<string, string> = {};

export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email ve şifre zorunlu." });
    return;
  }
  const exists = await db.collection<Admin>("admins").findOne({ email });
  if (exists) {
    res.status(400).json({ error: "Bu email ile admin zaten var." });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const admin: Admin = {
    email,
    password: hash,
    created_at: new Date(),
  };
  await db.collection<Admin>("admins").insertOne(admin);
  // uuid ile session id oluştur ve cookie'ye yaz
  const sessionId = uuidv4();
  sessions[sessionId] = email;
  res.cookie("admin_session", sessionId, cookieConfig);
  res.status(201).json({ message: "Admin kaydı başarılı." });
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const db = getDB();
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email ve şifre zorunlu." });
    return;
  }
  const admin = await db.collection<Admin>("admins").findOne({ email });
  if (!admin) {
    res.status(401).json({ error: "Geçersiz email veya şifre." });
    return;
  }
  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    res.status(401).json({ error: "Geçersiz email veya şifre." });
    return;
  }
  // uuid ile session id oluştur ve cookie'ye yaz
  const sessionId = uuidv4();
  sessions[sessionId] = email;
  res.cookie("admin_session", sessionId, cookieConfig);
  res.json({ message: "Giriş başarılı." });
};

// Auth middleware örneği (kullanmak istersen):
export function adminAuth(req: Request, res: Response, next: Function) {
  const sessionId = req.cookies?.admin_session;
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: "Yetkisiz." });
  }
  req.body.adminEmail = sessions[sessionId];
  next();
}
