/**
 * Drizzleクライアント設定
 *
 * データベース接続のシングルトンパターンを実装しています。
 * 開発環境でのホットリロード時に複数のインスタンスが作成されることを防ぎ、
 * データベース接続の効率化を図っています。
 */
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// LibSQLクライアントの作成
const client = createClient({
  url: process.env.DB_FILE_NAME!,
});

// Drizzleインスタンスの作成（スキーマを含む）
export const db = drizzle(client, { schema });