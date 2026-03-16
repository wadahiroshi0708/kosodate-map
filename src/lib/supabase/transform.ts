import type { GiveawayItem, GiveawayRequest } from "@/lib/data/types";
import type { GiveawayItemRow, GiveawayRequestRow } from "./types";

export function transformItemRow(row: GiveawayItemRow): GiveawayItem {
  return {
    id: row.id,
    municipalityId: row.municipality_id,
    lineUserId: row.line_user_id,
    displayName: row.display_name,
    title: row.title,
    description: row.description,
    category: row.category,
    ageRange: row.age_range,
    condition: row.condition,
    imageUrl: row.image_url,
    facilityId: row.facility_id,
    facilityName: row.facility_name,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function transformRequestRow(row: GiveawayRequestRow): GiveawayRequest {
  return {
    id: row.id,
    itemId: row.item_id,
    requesterLineUserId: row.requester_line_user_id,
    requesterDisplayName: row.requester_display_name,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}
