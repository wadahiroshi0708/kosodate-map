// ===================================
// データアクセス層 - インターフェース
// Phase 1: JSONファイルから読み込み
// Phase 2: Supabaseに切り替え可能
// ===================================

import type { Municipality, Nursery } from "./types";

export interface DataRepository {
  /** 全自治体の一覧を取得 */
  getMunicipalities(): Promise<Municipality[]>;

  /** 指定IDの自治体を取得 */
  getMunicipality(id: string): Promise<Municipality | null>;

  /** 指定自治体の保育施設一覧を取得 */
  getNurseries(municipalityId: string): Promise<Nursery[]>;

  /** 指定自治体の指定IDの保育施設を取得 */
  getNursery(
    municipalityId: string,
    nurseryId: string
  ): Promise<Nursery | null>;

  /** 自治体IDが存在するか確認 */
  municipalityExists(id: string): Promise<boolean>;
}
