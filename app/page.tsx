import { db } from "@/app/db";
import { topics, bookmarks } from "@/app/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { BookmarkManagerClient } from "@/components/bookmark-manager-client";
import { TopicWithBookmarkCount } from "@/hooks/use-topics";

/**
 * 初期表示用のトピック一覧を取得する
 */
async function getInitialTopics(): Promise<TopicWithBookmarkCount[]> {
  try {
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

    return topicsWithCount;
  } catch (error) {
    console.error("Error fetching initial topics:", error);
    return [];
  }
}

export default async function BookmarkManagerPage() {
  const initialTopics = await getInitialTopics();

  return <BookmarkManagerClient initialTopics={initialTopics} />;
}