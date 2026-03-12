"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Municipality, Nursery, Clinic, Location, TransportMode } from "@/lib/data/types";
import { rankNurseriesByDistance, rankClinicsByDistance } from "@/lib/geo/haversine";
import NurseryCard from "@/components/nursery/NurseryCard";
import ClinicCard from "@/components/clinic/ClinicCard";
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

type TabType = "nursery" | "clinic";

interface MunicipalityHomeProps {
  municipality: Municipality;
  nurseries: Nursery[];
  clinics: Clinic[];
}

export default function MunicipalityHome({
  municipality,
  nurseries,
  clinics,
}: MunicipalityHomeProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>("bike");
  const [selectedNurseryId, setSelectedNurseryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("nursery");

  const defaultCenter: Location = {
    lat: municipality.center_lat,
    lng: municipality.center_lng,
  };

  const rankedNurseries = useMemo(() => {
    if (!userLocation) return null;
    return rankNurseriesByDistance(nurseries, userLocation);
  }, [nurseries, userLocation]);

  const rankedClinics = useMemo(() => {
    if (!userLocation) return null;
    return rankClinicsByDistance(clinics, userLocation);
  }, [clinics, userLocation]);

  const handleLocationSet = useCallback((location: Location) => {
    setUserLocation(location);
  }, []);

  const dataDate = nurseries[0]?.data_date ?? "不明";

  return (
    <div className="space-y-4 p-4">
      {/* ウェルカムバナー */}
      <div className="bg-gradient-to-r from-[#2d9e6b] to-[#1a7a52] rounded-xl p-4 text-white">
        <h2 className="text-base font-bold mb-1">
          {municipality.name_ja}の子育て情報
        </h2>
        <p className="text-xs text-green-200">
          保育施設 {nurseries.length}件・医療機関 {clinics.length}件
          {activeTab === "nursery" && ` ・ データ更新日: ${dataDate}`}
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("nursery")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "nursery"
              ? "bg-white text-[#2d9e6b] shadow-sm"
              : "text-gray-500"
          }`}
        >
          🏫 保育施設
        </button>
        <button
          onClick={() => setActiveTab("clinic")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "clinic"
              ? "bg-white text-[#e05a2b] shadow-sm"
              : "text-gray-500"
          }`}
        >
          🏥 医療機関
        </button>
      </div>

      {/* 自宅位置設定 */}
      <AddressInput
        onLocationSet={handleLocationSet}
        defaultCenter={defaultCenter}
      />

      {/* マップ */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <LeafletMap
          nurseries={activeTab === "nursery" ? nurseries : []}
          clinics={activeTab === "clinic" ? clinics : []}
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

      {/* 保育施設タブ */}
      {activeTab === "nursery" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              {userLocation ? "🏆 近い順ランキング" : "📋 保育施設一覧"}
            </h3>
            <span className="text-xs text-gray-400">{nurseries.length}件</span>
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
              nurseries.map((nursery, index) => {
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
      )}

      {/* 医療機関タブ */}
      {activeTab === "clinic" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              {userLocation ? "🏆 近い順ランキング" : "📋 医療機関一覧"}
            </h3>
            <span className="text-xs text-gray-400">{clinics.length}件</span>
          </div>
          <div className="space-y-3">
            {userLocation && rankedClinics ? (
              rankedClinics.map((clinic, index) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  rank={index + 1}
                  municipalityId={municipality.id}
                  transportMode={transportMode}
                />
              ))
            ) : (
              clinics.map((clinic, index) => {
                const withDistance = {
                  ...clinic,
                  distance_km: 0,
                  distance_text: "−",
                  walk_minutes: 0,
                  bike_minutes: 0,
                  car_minutes: 0,
                };
                return (
                  <ClinicCard
                    key={clinic.id}
                    clinic={withDistance}
                    rank={index + 1}
                    municipalityId={municipality.id}
                    transportMode={transportMode}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 注意書き */}
      <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700 border border-yellow-200">
        <p className="font-semibold mb-1">⚠ ご注意</p>
        <ul className="space-y-1 text-yellow-600">
          <li>・ 距離は直線距離の概算です。</li>
          <li>・ 診療時間・休診日は変更されることがあります。受診前に各施設にご確認ください。</li>
          <li>・ 空き状況はデータ更新日時点のものです。</li>
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
