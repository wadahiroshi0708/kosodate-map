export interface GiveawayItemRow {
  id: string;
  municipality_id: string;
  line_user_id: string;
  display_name: string;
  title: string;
  description: string | null;
  category: "kids_clothes" | "toys" | "baby_goods";
  age_range: string | null;
  condition: "new" | "good" | "fair" | null;
  image_url: string | null;
  facility_id: string | null;
  facility_name: string | null;
  status: "available" | "reserved" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface GiveawayRequestRow {
  id: string;
  item_id: string;
  requester_line_user_id: string;
  requester_display_name: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}
