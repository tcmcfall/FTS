-- 001_core.sql
-- Ghosts of Velen Hosted FTS Wizards
-- Baseline core schema aligned to FTS map entity contracts.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS fts_campaigns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_key VARCHAR(80) NOT NULL,
  campaign_lookup_key VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_campaign_key (campaign_key),
  UNIQUE KEY uq_campaign_lookup_key (campaign_lookup_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  username VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor','viewer') NOT NULL DEFAULT 'admin',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_campaign (campaign_id),
  CONSTRAINT fk_users_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_content_packs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  pack_key VARCHAR(120) NOT NULL,
  pack_lookup_key VARCHAR(120) NOT NULL,
  pack_type ENUM('region','campaign','library','private') NOT NULL,
  name VARCHAR(200) NOT NULL,
  load_order INT NOT NULL DEFAULT 500,
  source_status ENUM('system','campaign','imported') NOT NULL DEFAULT 'campaign',
  is_public_exportable TINYINT(1) NOT NULL DEFAULT 1,
  notes TEXT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pack_campaign_lookup (campaign_id, pack_lookup_key),
  KEY idx_pack_type (pack_type),
  CONSTRAINT fk_pack_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pack_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES fts_users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  content_pack_id BIGINT UNSIGNED NULL,
  entity_key VARCHAR(120) NOT NULL,
  entity_lookup_key VARCHAR(120) NOT NULL,
  name VARCHAR(200) NOT NULL,
  entity_type ENUM('mapRegion','mapLocale','mapPoint','mapRoute','mapAgent') NOT NULL,
  region_key VARCHAR(120) NOT NULL,
  region_lookup_key VARCHAR(120) NOT NULL,
  locale_key VARCHAR(120) NOT NULL,
  locale_lookup_key VARCHAR(120) NOT NULL,
  canonical_locale_group ENUM('offshore','coastal','inland','underwater','underdark') NULL,
  source_status ENUM('system','campaign','imported','draft') NOT NULL DEFAULT 'campaign',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  created_by_user_id BIGINT UNSIGNED NULL,
  updated_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_entity_campaign_lookup (campaign_id, entity_lookup_key),
  KEY idx_entity_type (entity_type),
  KEY idx_entity_region_locale_lookup (region_lookup_key, locale_lookup_key),
  KEY idx_entity_campaign_active (campaign_id, is_active),
  CONSTRAINT fk_entity_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entity_pack
    FOREIGN KEY (content_pack_id) REFERENCES fts_content_packs(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_entity_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES fts_users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_entity_updated_by
    FOREIGN KEY (updated_by_user_id) REFERENCES fts_users(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_entity_lookup_nonempty CHECK (entity_lookup_key <> ''),
  CONSTRAINT chk_region_lookup_nonempty CHECK (region_lookup_key <> ''),
  CONSTRAINT chk_locale_lookup_nonempty CHECK (locale_lookup_key <> '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_demographics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_id BIGINT UNSIGNED NOT NULL,
  metric_key VARCHAR(120) NOT NULL,
  metric_value VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_demographic_metric (entity_id, metric_key),
  CONSTRAINT fk_demographic_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_politics (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  government VARCHAR(120) NOT NULL DEFAULT '',
  stability TINYINT UNSIGNED NOT NULL DEFAULT 3,
  law_level TINYINT UNSIGNED NOT NULL DEFAULT 3,
  corruption_level TINYINT UNSIGNED NOT NULL DEFAULT 3,
  CONSTRAINT chk_politics_stability CHECK (stability <= 5),
  CONSTRAINT chk_politics_law_level CHECK (law_level <= 5),
  CONSTRAINT chk_politics_corruption CHECK (corruption_level <= 5),
  CONSTRAINT fk_politics_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_power_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  offense TINYINT UNSIGNED NOT NULL DEFAULT 0,
  defense TINYINT UNSIGNED NOT NULL DEFAULT 0,
  aggression TINYINT UNSIGNED NOT NULL DEFAULT 0,
  projection ENUM('site','local','regional','multiRegional','global') NOT NULL DEFAULT 'local',
  mobility TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT chk_power_offense CHECK (offense <= 5),
  CONSTRAINT chk_power_defense CHECK (defense <= 5),
  CONSTRAINT chk_power_aggression CHECK (aggression <= 5),
  CONSTRAINT chk_power_mobility CHECK (mobility <= 5),
  CONSTRAINT fk_power_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_region_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  default_locale_key VARCHAR(120) NOT NULL,
  default_locale_lookup_key VARCHAR(120) NOT NULL,
  CONSTRAINT fk_map_region_profile_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_region_locales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_id BIGINT UNSIGNED NOT NULL,
  locale_key VARCHAR(120) NOT NULL,
  locale_lookup_key VARCHAR(120) NOT NULL,
  canonical_locale_group ENUM('offshore','coastal','inland','underwater','underdark') NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  UNIQUE KEY uq_region_locale_lookup (entity_id, locale_lookup_key),
  KEY idx_region_locale_sort (entity_id, sort_order),
  CONSTRAINT fk_map_region_locales_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_locale_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  parent_region_key VARCHAR(120) NOT NULL,
  parent_region_lookup_key VARCHAR(120) NOT NULL,
  climate_analogue VARCHAR(160) NOT NULL DEFAULT '',
  environment VARCHAR(160) NOT NULL DEFAULT '',
  CONSTRAINT fk_map_locale_profile_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_point_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  population INT UNSIGNED NOT NULL DEFAULT 0,
  development TINYINT UNSIGNED NOT NULL DEFAULT 0,
  wealth TINYINT UNSIGNED NOT NULL DEFAULT 0,
  security TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT chk_point_development CHECK (development <= 5),
  CONSTRAINT chk_point_wealth CHECK (wealth <= 5),
  CONSTRAINT chk_point_security CHECK (security <= 5),
  CONSTRAINT fk_map_point_profile_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_route_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  origin_key VARCHAR(120) NOT NULL,
  origin_lookup_key VARCHAR(120) NOT NULL,
  destination_key VARCHAR(120) NOT NULL,
  destination_lookup_key VARCHAR(120) NOT NULL,
  distance_label VARCHAR(120) NOT NULL DEFAULT '',
  CONSTRAINT fk_map_route_profile_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_route_stops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_id BIGINT UNSIGNED NOT NULL,
  stop_seq SMALLINT UNSIGNED NOT NULL,
  stop_key VARCHAR(120) NOT NULL,
  stop_lookup_key VARCHAR(120) NOT NULL,
  stop_name VARCHAR(200) NOT NULL DEFAULT '',
  UNIQUE KEY uq_route_stop_seq (entity_id, stop_seq),
  KEY idx_route_stop_lookup (entity_id, stop_lookup_key),
  CONSTRAINT fk_map_route_stop_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_route_segments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_id BIGINT UNSIGNED NOT NULL,
  segment_seq SMALLINT UNSIGNED NOT NULL,
  start_point_lookup_key VARCHAR(120) NULL,
  end_point_lookup_key VARCHAR(120) NULL,
  route_type VARCHAR(80) NOT NULL DEFAULT '',
  threat_rating TINYINT UNSIGNED NOT NULL DEFAULT 0,
  weather_sensitivity TINYINT UNSIGNED NOT NULL DEFAULT 0,
  delay_likelihood TINYINT UNSIGNED NOT NULL DEFAULT 0,
  geometry_wkt LONGTEXT NULL,
  notes TEXT NULL,
  UNIQUE KEY uq_route_segment_seq (entity_id, segment_seq),
  CONSTRAINT chk_route_segment_threat CHECK (threat_rating <= 5),
  CONSTRAINT chk_route_segment_weather CHECK (weather_sensitivity <= 5),
  CONSTRAINT chk_route_segment_delay CHECK (delay_likelihood <= 5),
  CONSTRAINT fk_map_route_segment_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_map_agent_profiles (
  entity_id BIGINT UNSIGNED PRIMARY KEY,
  size ENUM('individual','small','medium','large','massive') NOT NULL DEFAULT 'small',
  CONSTRAINT fk_map_agent_profile_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

