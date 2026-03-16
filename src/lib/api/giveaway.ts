import { liff } from "@/lib/liff/liffClient";
import type { GiveawayItem, GiveawayRequest } from "@/lib/data/types";

async function getIdToken(): Promise<string | null> {
  try {
    return liff.getIDToken();
  } catch {
    return null;
  }
}

async function authFetch(url: string, options: RequestInit = {}) {
  const idToken = await getIdToken();
  if (!idToken) throw new Error("LINEログインが必要です");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  });
}

export async function fetchGiveawayItems(
  municipality: string,
  category?: string
): Promise<GiveawayItem[]> {
  const params = new URLSearchParams({ municipality });
  if (category) params.set("category", category);

  const res = await fetch(`/api/giveaway/items?${params}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  const { items } = await res.json();
  return items;
}

export async function fetchGiveawayItem(itemId: string): Promise<GiveawayItem> {
  const res = await fetch(`/api/giveaway/items/${itemId}`);
  if (!res.ok) throw new Error("Failed to fetch item");
  const { item } = await res.json();
  return item;
}

export async function createGiveawayItem(data: {
  municipalityId: string;
  title: string;
  description?: string;
  category: string;
  ageRange?: string;
  condition?: string;
  facilityId?: string;
  facilityName?: string;
}): Promise<GiveawayItem> {
  const res = await authFetch("/api/giveaway/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "登録に失敗しました");
  }
  const { item } = await res.json();
  return item;
}

export async function requestGiveawayItem(
  itemId: string,
  message?: string
): Promise<void> {
  const res = await authFetch(`/api/giveaway/items/${itemId}/request`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "リクエストに失敗しました");
  }
}

export async function acceptGiveawayRequest(
  itemId: string,
  requestId: string
): Promise<void> {
  const res = await authFetch(`/api/giveaway/items/${itemId}/accept`, {
    method: "POST",
    body: JSON.stringify({ requestId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "承認に失敗しました");
  }
}

export async function fetchMyGiveawayData(municipality: string): Promise<{
  myItems: GiveawayItem[];
  myRequests: (GiveawayRequest & { giveaway_items: GiveawayItem })[];
  receivedRequests: GiveawayRequest[];
}> {
  const res = await authFetch(`/api/giveaway/mypage?municipality=${municipality}`);
  if (!res.ok) throw new Error("Failed to fetch mypage");
  return res.json();
}
