// ===================================
// Haversine距離計算 + 移動時間推定
// ===================================

import type {
  Location,
  Nursery,
  NurseryWithDistance,
  TransportMode,
  TRANSPORT_SPEEDS,
} from "../data/types";
import { TRANSPORT_SPEEDS as speeds } from "../data/types";

/** 地球の半径 (km) */
const EARTH_RADIUS_KM = 6371;

/** 度をラジアンに変換 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 2点間の直線距離を計算 (Haversine公式)
 * @returns 距離 (km)
 */
export function calculateDistance(
  from: Location,
  to: Location
): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * 直線距離から推定移動時間を計算 (分)
 * 直線距離に係数1.3をかけて実距離を推定
 */
export function estimateMinutes(
  distanceKm: number,
  mode: TransportMode
): number {
  const DETOUR_FACTOR = 1.3; // 直線距離 → 実距離の補正係数
  const actualKm = distanceKm * DETOUR_FACTOR;
  return Math.round((actualKm / speeds[mode]) * 60);
}

/**
 * 距離テキストを生成
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * 保育施設リストに距離情報を付与してソート
 */
export function rankNurseriesByDistance(
  nurseries: Nursery[],
  userLocation: Location
): NurseryWithDistance[] {
  return nurseries
    .filter((n) => n.location !== null)
    .map((nursery) => {
      const distance_km = calculateDistance(
        userLocation,
        nursery.location!
      );
      return {
        ...nursery,
        distance_km,
        distance_text: formatDistance(distance_km),
        walk_minutes: estimateMinutes(distance_km, "walk"),
        bike_minutes: estimateMinutes(distance_km, "bike"),
        car_minutes: estimateMinutes(distance_km, "car"),
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);
}
