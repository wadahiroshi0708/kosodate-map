// ===================================
// こそだてマップ - 共通型定義
// ===================================

/** 自治体メタ情報 */
export interface Municipality {
  id: string;
  name_ja: string;
  name_en: string;
  prefecture_ja: string;
  prefecture_en: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  contact: {
    department: string;
    phone: string;
  };
  data_sources: DataSource[];
  features_enabled: {
    nursery_map: boolean;
    clinic_search: boolean;
    gov_support: boolean;
  };
}

export interface DataSource {
  type: string;
  source_name: string;
  source_date: string;
  source_url: string | null;
}

/** 保育施設の種別 */
export type NurseryType =
  | "認可保育所"
  | "認定こども園"
  | "小規模保育"
  | "事業所内保育"
  | "幼稚園"
  | "認可外保育施設";

/** 空き状況の記号 */
export type AvailabilityStatus = "○" | "△" | "×" | null;

/** 年齢別空き状況 */
export interface Availability {
  age_0: AvailabilityStatus;
  age_1: AvailabilityStatus;
  age_2: AvailabilityStatus;
  age_3: AvailabilityStatus;
  age_4: AvailabilityStatus;
  age_5: AvailabilityStatus;
}

/** 緯度経度 */
export interface Location {
  lat: number;
  lng: number;
}

/** 保育施設 */
export interface Nursery {
  id: string;
  municipality_id: string;
  name: string;
  type: NurseryType;
  sub_area: string;
  address: string | null;
  tel: string | null;
  capacity: number;
  current_enrollment: number;
  age_from_months: number | null;
  hours: {
    open: string | null;
    close: string | null;
    extended_close: string | null;
  };
  extended_care: boolean | null;
  school_lunch: boolean | null;
  availability: Availability;
  location: Location | null;
  geocoded: boolean;
  notes: string;
  data_source: string;
  data_date: string;
  last_updated: string;
}

/** 距離計算結果付きの保育施設（フロントエンド用） */
export interface NurseryWithDistance extends Nursery {
  distance_km: number;
  distance_text: string;
  walk_minutes: number;
  bike_minutes: number;
  car_minutes: number;
}

/** 医療機関の施設種別 */
export type ClinicFacilityType = "クリニック" | "病院";

/** 診療時間 */
export interface ClinicHours {
  weekday_morning: string | null;
  weekday_afternoon: string | null;
  saturday: string | null;
  sunday: string | null;
}

/** 医療機関 */
export interface Clinic {
  id: string;
  municipality_id: string;
  name: string;
  facility_type: ClinicFacilityType;
  address: string;
  tel: string | null;
  departments: string[];
  hours: ClinicHours;
  closed: string | null;
  notes: string | null;
  location: Location | null;
  geocoded: boolean;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
}

/** 距離計算結果付きの医療機関（フロントエンド用） */
export interface ClinicWithDistance extends Clinic {
  distance_km: number;
  distance_text: string;
  walk_minutes: number;
  bike_minutes: number;
  car_minutes: number;
}

/** 行政サポートのカテゴリ */
export type GovSupportCategory =
  | "給付金・手当"
  | "医療費助成"
  | "保育・教育"
  | "産前産後"
  | "相談・支援"
  | "ひとり親支援"
  | "障害児支援";

/** 金額詳細の行 */
export interface AmountDetail {
  label: string;
  value: string;
}

/** 行政サポート制度 */
export interface GovSupport {
  id: string;
  municipality_id: string;
  category: GovSupportCategory;
  title: string;
  target: string;
  summary: string;
  amount: string | null;
  amount_detail: AmountDetail[];
  how_to_apply: string | null;
  no_application_needed: boolean;
  contact_name: string;
  contact_phone: string;
  url: string | null;
  tags: string[];
}

/** 転入チェックリストのアイテム */
export interface ChecklistItem {
  id: string;
  text: string;
  deadline: string | null;
  urgency: "high" | "medium" | "low";
  note: string | null;
}

/** チェックリストのセクション */
export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

/** ペルソナ別チェックリスト */
export interface PersonaChecklist {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
  sections: ChecklistSection[];
}

/** 自治体のチェックリスト全体 */
export interface MunicipalityChecklist {
  municipality_id: string;
  personas: PersonaChecklist[];
}

/** 移動手段 */
export type TransportMode = "walk" | "bike" | "car";

/** 移動手段ごとの速度 (km/h) */
export const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  walk: 4.5,
  bike: 12,
  car: 30,
};
