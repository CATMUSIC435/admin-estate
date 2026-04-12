import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/appwrite.admin';
import { ID } from 'node-appwrite';

/**
 * API để Admin gửi tin nhắn trả lời Khách
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { content, targetUserId, attachmentUrl } = payload; 

    if ((!content && !attachmentUrl) || !targetUserId) {
      return NextResponse.json({ error: "Missing content or targetUserId" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "chat_db";
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "messages";

    // Tạo Document
    const newDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        content: content,
        senderId: targetUserId, 
        senderType: 'agent', 
        attachmentUrl: attachmentUrl || undefined
      }
    );

    return NextResponse.json({ success: true, document: newDoc });

  } catch (error: any) {
    console.error("Admin Send Reply Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
