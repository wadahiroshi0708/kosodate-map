// ===================================
// イベントトラッキング Reactフック
// コンポーネントから呼びやすいラッパー
// ===================================

"use client";

import { useCallback, useEffect, useRef } from "react";
import { track } from "./tracker";
import type {
  FacilityViewProperties,
  FacilityFavoriteProperties,
  FacilityContactProperties,
  SearchProperties,
  SubsidyViewProperties,
  MunicipalityCompareProperties,
} from "./types";

// ===================================
// 施設閲覧トラッキング
// コンポーネントのマウント時間を計測して送信
// ===================================
export function useFacilityViewTracking(
  facilityId: string,
  facilityType: string,
  cameFrom: FacilityViewProperties["came_from"] = "list"
) {
  const mountTime = useRef<number>(Date.now());
  const visitCountKey = `visit_${facilityId}`;

  useEffect(() => {
    // 訪問カウントをインクリメント
    const prev = parseInt(sessionStorage.getItem(visitCountKey) ?? "0");
    const visitCount = prev + 1;
    sessionStorage.setItem(visitCountKey, String(visitCount));

    const sectionsViewed: string[] = ["基本情報"];

    return () => {
      const durationSec = Math.floor((Date.now() - mountTime.current) / 1000);
      track("facility_view", {
        facility_id: facilityId,
        facility_type: facilityType,
        view_duration_sec: durationSec,
        sections_viewed: sectionsViewed,
        came_from: cameFrom,
        visit_count: visitCount,
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);
}

// ===================================
// 検索トラッキング
// ===================================
export function useSearchTracking(municipalityId: string) {
  return useCallback(
    (params: {
      query?: string;
      facilityCategories?: string[];
      ageFilterMonths?: number | null;
      commuteMode?: SearchProperties["commute_mode"];
      resultCount?: number;
    }) => {
      track("search", {
        query: params.query ?? null,
        facility_categories: params.facilityCategories ?? [],
        age_filter_months: params.ageFilterMonths ?? null,
        commute_mode: params.commuteMode ?? null,
        target_municipality_id: municipalityId,
        is_cross_municipality: false, // 複数自治体対応時に更新
        result_count: params.resultCount ?? 0,
      });
    },
    [municipalityId]
  );
}

// ===================================
// お気に入りトラッキング
// ===================================
export function useFavoriteTracking() {
  return useCallback(
    (
      facilityId: string,
      facilityType: string,
      action: FacilityFavoriteProperties["action"],
      totalFavorites: number
    ) => {
      track("facility_favorite", {
        facility_id: facilityId,
        facility_type: facilityType,
        action,
        favorite_count: totalFavorites,
      });
    },
    []
  );
}

// ===================================
// 施設コンタクトトラッキング（電話・地図・サイト）
// ===================================
export function useContactTracking() {
  return useCallback(
    (
      facilityId: string,
      facilityType: string,
      actionType: FacilityContactProperties["action_type"]
    ) => {
      track("facility_contact", {
        facility_id: facilityId,
        facility_type: facilityType,
        action_type: actionType,
      });
    },
    []
  );
}

// ===================================
// 行政制度閲覧トラッキング
// ===================================
export function useSubsidyViewTracking(municipalityId: string) {
  return useCallback(
    (subsidyId: string, subsidyCategory: string) => {
      const mountTime = Date.now();
      // クリーンアップ関数を返す（閲覧時間の計測）
      return () => {
        const durationSec = Math.floor((Date.now() - mountTime) / 1000);
        track("subsidy_view", {
          subsidy_id: subsidyId,
          subsidy_category: subsidyCategory,
          target_municipality_id: municipalityId,
          is_cross_municipality: false,
          view_duration_sec: durationSec,
        });
      };
    },
    [municipalityId]
  );
}

// ===================================
// 自治体比較トラッキング
// ===================================
export function useMunicipalityCompareTracking() {
  return useCallback(
    (
      fromMunicipality: string,
      toMunicipality: string,
      context: MunicipalityCompareProperties["compare_context"]
    ) => {
      track("municipality_compare", {
        from_municipality_id: fromMunicipality,
        to_municipality_id: toMunicipality,
        compare_context: context,
      });
    },
    []
  );
}
