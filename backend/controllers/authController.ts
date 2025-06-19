import { Request, Response } from "express";
import { getDB } from "../config/mongo";
import { User, hashPassword, comparePassword } from "../models/user";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "gizli-anahtar";
const COOKIE_EXPIRES = 24 * 60 * 60 * 1000; // 24 saat

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDB();
    const { name, email, password } = req.body;

    const existingUser = await db.collection<User>("users").findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Bu email zaten kayıtlı" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user: User = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<User>("users").insertOne(user);
    const token = jwt.sign({ id: result.insertedId }, JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_EXPIRES,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Kayıt işlemi başarısız" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    const user = await db.collection<User>("users").findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Email veya şifre hatalı" });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Email veya şifre hatalı" });
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_EXPIRES,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Giriş işlemi başarısız" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Çıkış yapıldı" });
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ error: "Yetkilendirme gerekli" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const db = getDB();
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      res.status(404).json({ error: "Kullanıcı bulunamadı" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ error: "Geçersiz token" });
  }
};
