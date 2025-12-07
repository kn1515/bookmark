import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { topics, bookmarks } from "@/app/db/schema";
import { desc, eq, count } from "drizzle-orm";

/**
 * 全てのトピック一覧を取得する
 *
 * @returns トピック一覧（ブックマーク数を含む、更新日時の降順）
 */
export async function GET() {
  try {
    // トピック一覧を取得し、各トピックのブックマーク数も集計
    const topicsWithCount = await db
      .select({
        id: topics.id,
        title: topics.title,
        description: topics.description,
        emoji: topics.emoji,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
        bookmarkCount: count(bookmarks.id),
      })
      .from(topics)
      .leftJoin(bookmarks, eq(topics.id, bookmarks.topicId))
      .groupBy(topics.id)
      .orderBy(desc(topics.updatedAt));

    return NextResponse.json(topicsWithCount);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

/**
 * 新しいトピックを作成する
 *
 * @param request - リクエストオブジェクト（title, description, emojiを含む）
 * @returns 作成されたトピック情報（ブックマーク数を含む）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, emoji } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 新しいトピックを作成
    const [newTopic] = await db
      .insert(topics)
      .values({
        title,
        description: description || null,
        emoji: emoji || "📁",
      })
      .returning();

    // レスポンス用にブックマーク数を追加
    const topicWithCount = {
      ...newTopic,
      bookmarkCount: 0,
    };

    return NextResponse.json(topicWithCount, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}