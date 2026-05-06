-- 002_libraries.sql
-- Reusable libraries + period-fidelity trade storage.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS fts_calendar_periods (
  period_key VARCHAR(40) PRIMARY KEY,
  season ENUM('spring','summer','autumn','winter') NOT NULL,
  month_number TINYINT UNSIGNED NULL,
  is_festival TINYINT(1) NOT NULL DEFAULT 0,
  sort_order SMALLINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO fts_calendar_periods (period_key, season, month_number, is_festival, sort_order) VALUES
('hammer','winter',1,0,10),
('midwinter','winter',NULL,1,20),
('alturiak','winter',2,0,30),
('ches','spring',3,0,40),
('tarsakh','spring',4,0,50),
('greengrass','spring',NULL,1,60),
('mirtul','spring',5,0,70),
('kythorn','summer',6,0,80),
('flamerule','summer',7,0,90),
('midsummer','summer',NULL,1,100),
('shieldmeet','summer',NULL,1,110),
('eleasis','summer',8,0,120),
('eleint','autumn',9,0,130),
('highharvestide','autumn',NULL,1,140),
('marpenoth','autumn',10,0,150),
('uktar','autumn',11,0,160),
('feastofthemoon','autumn',NULL,1,170),
('nightal','winter',12,0,180)
ON DUPLICATE KEY UPDATE
  season = VALUES(season),
  month_number = VALUES(month_number),
  is_festival = VALUES(is_festival),
  sort_order = VALUES(sort_order);

CREATE TABLE IF NOT EXISTS fts_trade_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  category_key VARCHAR(120) NOT NULL,
  category_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trade_category_campaign_lookup (campaign_id, category_lookup_key),
  CONSTRAINT fk_trade_category_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_trade_goods (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  category_id BIGINT UNSIGNED NULL,
  good_key VARCHAR(120) NOT NULL,
  good_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  unit_label VARCHAR(40) NOT NULL DEFAULT 'cu',
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trade_good_campaign_lookup (campaign_id, good_lookup_key),
  KEY idx_trade_goods_category (category_id),
  CONSTRAINT fk_trade_good_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_trade_good_category
    FOREIGN KEY (category_id) REFERENCES fts_trade_categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_trade_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_id BIGINT UNSIGNED NOT NULL,
  period_key VARCHAR(40) NOT NULL,
  stance ENUM('has','wants','needs') NOT NULL,
  good_key VARCHAR(120) NOT NULL,
  good_lookup_key VARCHAR(120) NOT NULL,
  volume TINYINT UNSIGNED NOT NULL DEFAULT 3,
  cargo_units DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_modifier DECIMAL(8,3) NOT NULL DEFAULT 0.000,
  notes TEXT NULL,
  UNIQUE KEY uq_trade_entity_period_stance_good (entity_id, period_key, stance, good_lookup_key),
  KEY idx_trade_entity_period (entity_id, period_key),
  KEY idx_trade_good_lookup (good_lookup_key),
  CONSTRAINT chk_trade_volume CHECK (volume <= 5),
  CONSTRAINT fk_trade_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_trade_period
    FOREIGN KEY (period_key) REFERENCES fts_calendar_periods(period_key)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_factions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  faction_key VARCHAR(120) NOT NULL,
  faction_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_faction_campaign_lookup (campaign_id, faction_lookup_key),
  CONSTRAINT fk_faction_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_religions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  religion_key VARCHAR(120) NOT NULL,
  religion_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_religion_campaign_lookup (campaign_id, religion_lookup_key),
  CONSTRAINT fk_religion_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_tags (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  tag_key VARCHAR(120) NOT NULL,
  tag_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_tag_campaign_lookup (campaign_id, tag_lookup_key),
  CONSTRAINT fk_tag_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

