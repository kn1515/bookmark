import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { topics, bookmarks } from "@/app/db/schema";
import { eq, count } from "drizzle-orm";

/**
 * 指定されたトピックの詳細情報を取得する
 *
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（トピックIDを含む）
 * @returns トピック詳細情報（ブックマーク数を含む）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // トピックとブックマーク数を取得
    const [topicWithCount] = await db
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
      .where(eq(topics.id, id))
      .groupBy(topics.id);

    if (!topicWithCount) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(topicWithCount);
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
  }
}

/**
 * 指定されたトピックの情報を更新する
 *
 * @param request - リクエストオブジェクト（title, description, emojiを含む）
 * @param params - URLパラメータ（トピックIDを含む）
 * @returns 更新されたトピック情報（ブックマーク数を含む）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, emoji } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // トピックを更新
    const [updatedTopic] = await db
      .update(topics)
      .set({
        title,
        description: description || null,
        emoji: emoji || "📁",
        updatedAt: new Date(),
      })
      .where(eq(topics.id, id))
      .returning();

    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // ブックマーク数を取得して追加
    const [bookmarkCountResult] = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(eq(bookmarks.topicId, id));

    const topicWithCount = {
      ...updatedTopic,
      bookmarkCount: bookmarkCountResult?.count || 0,
    };

    return NextResponse.json(topicWithCount);
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

/**
 * 指定されたトピックを削除する
 *
 * @param request - リクエストオブジェクト
 * @param params - URLパラメータ（トピックIDを含む）
 * @returns 削除成功メッセージ
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // トピックを削除（onDelete: cascade により関連ブックマークも削除）
    const [deletedTopic] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();

    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}