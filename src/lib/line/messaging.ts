const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message/push";

export async function sendLinePush(userId: string, text: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN not set, skipping push");
    return false;
  }

  try {
    const res = await fetch(LINE_MESSAGING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("LINE push failed:", res.status, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("LINE push error:", err);
    return false;
  }
}
