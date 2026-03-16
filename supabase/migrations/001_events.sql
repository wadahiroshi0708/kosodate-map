-- ===================================
-- こそだてMAP イベントトラッキング
-- マイグレーション: 001_events.sql
-- ===================================

-- ===================================
-- anonymous_users: 匿名ユーザー管理
-- LINE User IDは一切保存しない（ハッシュのみ）
-- ===================================
CREATE TABLE IF NOT EXISTS anonymous_users (
  anonymous_id      TEXT        PRIMARY KEY,  -- SHA-256ハッシュ
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  municipality_id   TEXT        NULL,         -- 初回訪問の自治体（市区町村コード）
  child_age_group   TEXT        NULL,         -- オンボーディング回答: '0-1歳' など
  move_intent       TEXT        NULL,         -- '3ヶ月以内' | '半年以内' | '1年以内' | '未定'
  work_status       TEXT        NULL,         -- 'fulltime' | 'parttime' | 'leave'
  platform          TEXT        NOT NULL DEFAULT 'web',
  session_count     INTEGER     NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================
-- events: 全ユーザー行動ログ
-- ===================================
CREATE TABLE IF NOT EXISTS events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id    TEXT        NOT NULL REFERENCES anonymous_users(anonymous_id),
  session_id      TEXT        NOT NULL,
  event_type      TEXT        NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL,
  geo_h3_r8       TEXT        NULL,         -- H3インデックス 解像度8（≈600m圏）
  municipality_id TEXT        NOT NULL,
  platform        TEXT        NOT NULL DEFAULT 'web',
  properties      JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス（クエリパターンに最適化）
CREATE INDEX IF NOT EXISTS idx_events_event_type
  ON events (event_type);

CREATE INDEX IF NOT EXISTS idx_events_municipality_occurred
  ON events (municipality_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_anonymous_id
  ON events (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_events_geo_h3
  ON events (geo_h3_r8)
  WHERE geo_h3_r8 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_occurred_at
  ON events (occurred_at DESC);

-- JSONBインデックス（検索クエリの高速化）
CREATE INDEX IF NOT EXISTS idx_events_properties_facility
  ON events USING gin ((properties -> 'facility_id'));

CREATE INDEX IF NOT EXISTS idx_events_properties_target_municipality
  ON events USING gin ((properties -> 'target_municipality_id'));

-- ===================================
-- updated_at 自動更新トリガー
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER anonymous_users_updated_at
  BEFORE UPDATE ON anonymous_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===================================
-- Row Level Security (RLS)
-- ===================================
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;

-- 読み書きはサービスロール（admin）のみ
-- anon（クライアント）はINSERT専用にする
CREATE POLICY "events_insert_anon"
  ON events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anonymous_users_upsert_anon"
  ON anonymous_users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anonymous_users_update_anon"
  ON anonymous_users FOR UPDATE
  TO anon
  USING (true);

-- SELECTはサービスロールのみ（B2Bデータ集計はサーバーサイドで行う）
CREATE POLICY "events_select_service"
  ON events FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "anonymous_users_select_service"
  ON anonymous_users FOR SELECT
  TO service_role
  USING (true);

-- ===================================
-- B2Bデータ製品用集計ビュー
-- k-匿名性: 10ユーザー未満のセルは非公開
-- ===================================

-- 需要ヒートマップ（出店計画・政策分析向け）
CREATE OR REPLACE VIEW demand_heatmap AS
SELECT
  municipality_id,
  geo_h3_r8,
  properties->>'facility_categories' AS facility_category_raw,
  DATE_TRUNC('week', occurred_at)    AS week,
  COUNT(DISTINCT anonymous_id)       AS unique_users,
  COUNT(*)                           AS search_count
FROM events
WHERE
  event_type = 'search'
  AND geo_h3_r8 IS NOT NULL
GROUP BY 1, 2, 3, 4
HAVING COUNT(DISTINCT anonymous_id) >= 10;  -- k-匿名性: 10件未満は非公開

-- 転居フロー（政策・不動産向け）
CREATE OR REPLACE VIEW migration_flow AS
SELECT
  u.municipality_id                           AS from_municipality,
  e.properties->>'target_municipality_id'     AS to_municipality,
  DATE_TRUNC('month', e.occurred_at)          AS month,
  COUNT(DISTINCT e.anonymous_id)              AS unique_users
FROM events e
JOIN anonymous_users u ON e.anonymous_id = u.anonymous_id
WHERE
  e.event_type = 'search'
  AND e.properties->>'is_cross_municipality' = 'true'
  AND u.municipality_id IS NOT NULL
GROUP BY 1, 2, 3
HAVING COUNT(DISTINCT e.anonymous_id) >= 10;

-- 施設選択パターン（コンジョイント分析用）
CREATE OR REPLACE VIEW facility_preference AS
SELECT
  municipality_id,
  event_type,
  properties->>'facility_type'  AS facility_type,
  DATE_TRUNC('month', occurred_at) AS month,
  COUNT(DISTINCT anonymous_id)  AS unique_users,
  COUNT(*)                      AS event_count,
  AVG(
    CASE WHEN properties->>'view_duration_sec' IS NOT NULL
    THEN (properties->>'view_duration_sec')::float
    END
  )                             AS avg_view_duration_sec
FROM events
WHERE event_type IN ('facility_view', 'facility_favorite', 'facility_contact')
GROUP BY 1, 2, 3, 4
HAVING COUNT(DISTINCT anonymous_id) >= 10;
