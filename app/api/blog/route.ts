import { NextResponse, NextRequest } from "next/server";

const WP_API_URL = process.env.WP_API_URL || "https://atservice.vn/wp-json/wp/v2";
const WP_USERNAME = process.env.WP_USERNAME;
const WP_PASSWORD = process.env.WP_APPLICATION_PASSWORD;

function getAuthHeader() {
  if (!WP_USERNAME || !WP_PASSWORD || WP_USERNAME === "your_wp_username") {
    return null;
  }
  return `Basic ${Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64')}`;
}

export async function GET(request: NextRequest) {
  try {
    // Get posts with embedded media for thumbnails
    const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=100`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`WordPress API Error: ${res.statusText}`);
    }
    
    const posts = await res.json();
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return NextResponse.json({ error: "Chưa cấu hình tài khoản WordPress (WP_USERNAME / WP_APPLICATION_PASSWORD) trong .env" }, { status: 401 });
    }

    const body = await request.json();
    
    // WordPress payload structure
    const wpPayload = {
      title: body.title,
      content: body.content,
      excerpt: body.description,
      slug: body.slug,
      status: 'publish', // Default to publish
    };

    const res = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(wpPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `WordPress Error: ${res.statusText}`);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
