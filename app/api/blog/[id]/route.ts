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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return NextResponse.json({ error: "Chưa cấu hình tài khoản WordPress (WP_USERNAME / WP_APPLICATION_PASSWORD) trong .env" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // WordPress payload structure
    const wpPayload = {
      title: body.title,
      content: body.content,
      excerpt: body.description,
      slug: body.slug,
      status: 'publish', 
    };

    const res = await fetch(`${WP_API_URL}/posts/${id}`, {
      method: 'PUT', // or POST to specific ID endpoint in WP
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return NextResponse.json({ error: "Chưa cấu hình tài khoản WordPress (WP_USERNAME / WP_APPLICATION_PASSWORD) trong .env" }, { status: 401 });
    }

    const { id } = await params;

    // WP requires ?force=true to completely delete instead of moving to trash
    const res = await fetch(`${WP_API_URL}/posts/${id}?force=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `WordPress Error: ${res.statusText}`);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
