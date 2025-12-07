import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

/**
 * トピック（ブックマークのカテゴリ）テーブル
 *
 * ブックマークを整理するためのカテゴリ機能を提供します。
 * 各トピックには複数のブックマークを関連付けることができます。
 */
export const topics = sqliteTable("topics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  emoji: text("emoji"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * ブックマーク（保存されたURL）テーブル
 *
 * ユーザーが保存したいWebページのURL情報を管理します。
 * 必ずいずれかのトピックに関連付けられます。
 */
export const bookmarks = sqliteTable("bookmarks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  // 外部キー: 所属するトピックのID
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
});

/**
 * トピックとブックマークのリレーション定義
 */
export const topicsRelations = relations(topics, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  topic: one(topics, {
    fields: [bookmarks.topicId],
    references: [topics.id],
  }),
}));

// 型定義のエクスポート
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;