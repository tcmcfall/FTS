-- 004_exports_audit.sql
-- Export artifact storage + comprehensive audit trail.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS fts_content_pack_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content_pack_id BIGINT UNSIGNED NOT NULL,
  entity_type ENUM('mapRegion','mapLocale','mapPoint','mapRoute','mapAgent') NOT NULL,
  entity_lookup_key VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 100,
  UNIQUE KEY uq_pack_item (content_pack_id, entity_type, entity_lookup_key),
  KEY idx_pack_item_order (content_pack_id, sort_order),
  CONSTRAINT fk_pack_item_pack
    FOREIGN KEY (content_pack_id) REFERENCES fts_content_packs(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_exports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  export_kind ENUM('entity','contentPack') NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  content_pack_id BIGINT UNSIGNED NULL,
  schema_name VARCHAR(120) NOT NULL,
  payload_json LONGTEXT NOT NULL,
  payload_sha256 CHAR(64) NOT NULL,
  generated_by_user_id BIGINT UNSIGNED NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  KEY idx_exports_campaign_time (campaign_id, generated_at),
  KEY idx_exports_entity (entity_id),
  KEY idx_exports_content_pack (content_pack_id),
  CONSTRAINT fk_exports_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_exports_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_exports_content_pack
    FOREIGN KEY (content_pack_id) REFERENCES fts_content_packs(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_exports_user
    FOREIGN KEY (generated_by_user_id) REFERENCES fts_users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_fts_exports_validate_insert$$
CREATE TRIGGER trg_fts_exports_validate_insert
BEFORE INSERT ON fts_exports
FOR EACH ROW
BEGIN
  IF NEW.export_kind = 'entity' AND (NEW.entity_id IS NULL OR NEW.content_pack_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'fts_exports entity export requires entity_id and null content_pack_id';
  END IF;

  IF NEW.export_kind = 'contentPack' AND NEW.content_pack_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'fts_exports contentPack export requires content_pack_id';
  END IF;
END$$

DROP TRIGGER IF EXISTS trg_fts_exports_validate_update$$
CREATE TRIGGER trg_fts_exports_validate_update
BEFORE UPDATE ON fts_exports
FOR EACH ROW
BEGIN
  IF NEW.export_kind = 'entity' AND (NEW.entity_id IS NULL OR NEW.content_pack_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'fts_exports entity export requires entity_id and null content_pack_id';
  END IF;

  IF NEW.export_kind = 'contentPack' AND NEW.content_pack_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'fts_exports contentPack export requires content_pack_id';
  END IF;
END$$

DELIMITER ;

CREATE TABLE IF NOT EXISTS fts_audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  entity_id BIGINT UNSIGNED NULL,
  content_pack_id BIGINT UNSIGNED NULL,
  export_id BIGINT UNSIGNED NULL,
  action ENUM('create','update','deactivate','delete','export','import','login','logout','schema_migrate') NOT NULL,
  object_type ENUM('entity','tradeEntry','relationship','contentPack','auth','export','system') NOT NULL,
  object_lookup_key VARCHAR(120) NULL,
  request_id CHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  before_json LONGTEXT NULL,
  after_json LONGTEXT NULL,
  metadata_json LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (before_json IS NULL OR JSON_VALID(before_json)),
  CHECK (after_json IS NULL OR JSON_VALID(after_json)),
  CHECK (metadata_json IS NULL OR JSON_VALID(metadata_json)),
  KEY idx_audit_campaign_time (campaign_id, created_at),
  KEY idx_audit_user_time (user_id, created_at),
  KEY idx_audit_entity_time (entity_id, created_at),
  KEY idx_audit_request (request_id),
  CONSTRAINT fk_audit_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES fts_users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_audit_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_audit_pack
    FOREIGN KEY (content_pack_id) REFERENCES fts_content_packs(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_audit_export
    FOREIGN KEY (export_id) REFERENCES fts_exports(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
