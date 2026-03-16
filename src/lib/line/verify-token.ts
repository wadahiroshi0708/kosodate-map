interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

const LINE_LOGIN_CHANNEL_ID = process.env.NEXT_PUBLIC_LIFF_ID?.split("-")[0];

export async function verifyLiffToken(idToken: string): Promise<LineProfile | null> {
  if (!LINE_LOGIN_CHANNEL_ID) return null;

  try {
    const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: LINE_LOGIN_CHANNEL_ID,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      userId: data.sub,
      displayName: data.name,
      pictureUrl: data.picture,
    };
  } catch {
    return null;
  }
}
