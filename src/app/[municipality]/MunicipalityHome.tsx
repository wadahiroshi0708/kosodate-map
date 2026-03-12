"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Municipality, Nursery, Location, TransportMode } from "@/lib/data/types";
import { rankNurseriesByDistance } from "@/lib/geo/haversine";
import NurseryCard from "@/components/nursery/NurseryCard";
import TransportSelector from "@/components/nursery/TransportSelector";
import AddressInput from "@/components/common/AddressInput";

// Leafletはクライアントのみでロード（SSR無効化）
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
      地図を読み込み中...
    </div>
  ),
});

interface MunicipalityHomeProps {
  municipality: Municipality;
  nurseries: Nursery[];
}

export default function MunicipalityHome({
  municipality,
  nurseries,
}: MunicipalityHomeProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>("bike");
  const [selectedNurseryId, setSelectedNurseryId] = useState<string | null>(null);

  const defaultCenter: Location = {
    lat: municipality.center_lat,
    lng: municipality.center_lng,
  };

  // 距離計算・ランキング
  const rankedNurseries = useMemo(() => {
    if (!userLocation) return null;
    return rankNurseriesByDistance(nurseries, userLocation);
  }, [nurseries, userLocation]);

  const handleLocationSet = useCallback((location: Location) => {
    setUserLocation(location);
  }, []);

  // データ更新日を取得
  const dataDate = nurseries[0]?.data_date ?? "不明";

  return (
    <div className="space-y-4 p-4">
      {/* ウェルカムバナー */}
      <div className="bg-gradient-to-r from-[#2d9e6b] to-[#1a7a52] rounded-xl p-4 text-white">
        <h2 className="text-base font-bold mb-1">
          {municipality.name_ja}の保育施設
        </h2>
        <p className="text-xs text-green-200">
          全{nurseries.length}施設 ・ データ更新日: {dataDate}
        </p>
      </div>

      {/* 自宅位置設定 */}
      <AddressInput
        onLocationSet={handleLocationSet}
        defaultCenter={defaultCenter}
      />

      {/* マップ */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <LeafletMap
          nurseries={nurseries}
          center={defaultCenter}
          zoom={municipality.default_zoom}
          userLocation={userLocation}
          selectedNurseryId={selectedNurseryId}
          onNurseryClick={setSelectedNurseryId}
          className="h-[250px]"
        />
      </div>

      {/* 移動手段セレクター */}
      {userLocation && <TransportSelector selected={transportMode} onChange={setTransportMode} />}

      {/* 保育施設リスト */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            {userLocation ? "🏆 近い順ランキング" : "📋 保育施設一覧"}
          </h3>
          <span className="text-xs text-gray-400">
            {nurseries.length}件
          </span>
        </div>

        <div className="space-y-3">
          {userLocation && rankedNurseries ? (
            rankedNurseries.map((nursery, index) => (
              <NurseryCard
                key={nursery.id}
                nursery={nursery}
                rank={index + 1}
                municipalityId={municipality.id}
                transportMode={transportMode}
              />
            ))
          ) : (
            // 位置未設定時：そのまま一覧表示
            nurseries.map((nursery, index) => {
              // 距離なしのダミーデータを作る
              const withDistance = {
                ...nursery,
                distance_km: 0,
                distance_text: "−",
                walk_minutes: 0,
                bike_minutes: 0,
                car_minutes: 0,
              };
              return (
                <NurseryCard
                  key={nursery.id}
                  nursery={withDistance}
                  rank={index + 1}
                  municipalityId={municipality.id}
                  transportMode={transportMode}
                />
              );
            })
          )}
        </div>
      </div>

      {/* 注意書き */}
      <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700 border border-yellow-200">
        <p className="font-semibold mb-1">⚠ ご注意</p>
        <ul className="space-y-1 text-yellow-600">
          <li>・ 距離は直線距離の概算です。実際の通園経路とは異なります。</li>
          <li>・ 空き状況はデータ更新日時点のものです。最新情報は各施設にお問い合わせください。</li>
          <li>・ 座標は概算値です。正確な位置は施設の公式情報をご確認ください。</li>
        </ul>
      </div>

      {/* 問い合わせ先 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-500 mb-1">保育施設に関するお問い合わせ</p>
        <p className="text-sm font-semibold text-gray-700">
          {municipality.contact.department}
        </p>
        <a
          href={`tel:${municipality.contact.phone}`}
          className="inline-block mt-2 bg-[#f0faf5] text-[#2d9e6b] rounded-lg px-4 py-2 text-sm font-semibold"
        >
          📞 {municipality.contact.phone}
        </a>
      </div>
    </div>
  );
}
