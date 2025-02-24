// app/api/timers/create/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const { duration, castHash, fid, notificationDetails } = await req.json();

    // Validate inputs
    if (!duration || !castHash || !fid || !notificationDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create unique timer ID
    const timerId = `timer:${fid}:${castHash}:${Date.now()}`;

    // Store timer data
    const timer = {
      id: timerId,
      fid,
      castHash,
      duration,
      createdAt: Date.now(),
      expiresAt: Date.now() + duration * 60 * 60 * 1000, // hours to ms
      notificationDetails,
      status: "pending",
    };

    // Save to KV store
    await kv.set(timerId, timer);

    // Add to user's timer list
    await kv.sadd(`user:${fid}:timers`, timerId);

    // Schedule notification (implementation will vary based on your notification system)
    await scheduleNotification(timer);

    return NextResponse.json({
      success: true,
      timer: {
        id: timerId,
        expiresAt: timer.expiresAt,
      },
    });
  } catch (error) {
    console.error("Failed to create timer:", error);
    return NextResponse.json(
      { error: "Failed to create timer" },
      { status: 500 }
    );
  }
}

// Helper function to schedule notification
async function scheduleNotification(timer: any) {
  // This implementation will depend on your notification system
  // Could use a queue system like Bull, or a webhook service

  const notificationPayload = {
    url: timer.notificationDetails.url,
    token: timer.notificationDetails.token,
    notification: {
      title: "Thread Timer",
      body: "Time to check back on the conversation!",
      targetUrl: `https://warpcast.com/${timer.castHash}`, // Link back to thread
    },
  };

  // Store notification in queue
  await kv.set(`notification:${timer.id}`, {
    ...notificationPayload,
    scheduledFor: timer.expiresAt,
  });
}
