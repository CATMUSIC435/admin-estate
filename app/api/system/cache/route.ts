import { NextResponse } from "next/server";

export async function POST() {
  try {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

    const results = {
      redis: false,
      nextjs: false,
      errors: [] as string[]
    };

    // 1. CLEAR UPSTASH REDIS (Backend Cache)
    if (upstashUrl && upstashToken) {
      try {
        const redisRes = await fetch(`${upstashUrl}/FLUSHDB`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${upstashToken}`,
          },
        });
        
        if (redisRes.ok) {
          results.redis = true;
        } else {
          results.errors.push(`Redis Error: ${redisRes.status} ${redisRes.statusText}`);
        }
      } catch (err: any) {
        results.errors.push(`Redis Connection Error: ${err.message}`);
      }
    } else {
      results.errors.push("Missing Upstash Redis Credentials in .env");
    }

    // 2. CLEAR NEXT.JS CACHE (Frontend Cache via Revalidate Route)
    try {
      const nextjsRes = await fetch(`${frontendUrl}/api/revalidate`, {
        method: "GET", 
        // using GET as the route in main source `app/api/revalidate/route.ts` defaults to GET without params to clear '/' layout
      });
      
      if (nextjsRes.ok) {
        results.nextjs = true;
      } else {
        results.errors.push(`NextJS Revalidate Error: ${nextjsRes.status} ${nextjsRes.statusText}`);
      }
    } catch (err: any) {
      results.errors.push(`NextJS Connection Error: ${err.message}`);
    }

    if (results.redis || results.nextjs) {
      return NextResponse.json({ success: true, results });
    } else {
      return NextResponse.json({ success: false, results }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
