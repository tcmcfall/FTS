-- 003_relationships.sql
-- Relationship matrix + deterministic export projection rules + mappings.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS fts_entity_factions (
  entity_id BIGINT UNSIGNED NOT NULL,
  faction_id BIGINT UNSIGNED NOT NULL,
  influence_level TINYINT UNSIGNED NOT NULL DEFAULT 3,
  PRIMARY KEY (entity_id, faction_id),
  CONSTRAINT chk_entity_faction_influence CHECK (influence_level <= 5),
  CONSTRAINT fk_entity_faction_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entity_faction_faction
    FOREIGN KEY (faction_id) REFERENCES fts_factions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_religions (
  entity_id BIGINT UNSIGNED NOT NULL,
  religion_id BIGINT UNSIGNED NOT NULL,
  influence_level TINYINT UNSIGNED NOT NULL DEFAULT 3,
  PRIMARY KEY (entity_id, religion_id),
  CONSTRAINT chk_entity_religion_influence CHECK (influence_level <= 5),
  CONSTRAINT fk_entity_religion_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entity_religion_religion
    FOREIGN KEY (religion_id) REFERENCES fts_religions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_entity_tags (
  entity_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (entity_id, tag_id),
  CONSTRAINT fk_entity_tag_entity
    FOREIGN KEY (entity_id) REFERENCES fts_entities(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entity_tag_tag
    FOREIGN KEY (tag_id) REFERENCES fts_tags(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_relationships (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  source_entity_lookup_key VARCHAR(120) NOT NULL,
  target_entity_lookup_key VARCHAR(120) NOT NULL,
  status ENUM('allied','friendly','neutral','tense','rival','hostile','war','covert') NOT NULL DEFAULT 'neutral',
  visibility ENUM('public','gmOnly','secret') NOT NULL DEFAULT 'gmOnly',
  reason TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_relationship_pair (campaign_id, source_entity_lookup_key, target_entity_lookup_key),
  KEY idx_relationship_source (campaign_id, source_entity_lookup_key),
  KEY idx_relationship_target (campaign_id, target_entity_lookup_key),
  CONSTRAINT fk_relationship_campaign
    FOREIGN KEY (campaign_id) REFERENCES fts_campaigns(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fts_relationship_export_rules (
  status ENUM('allied','friendly','neutral','tense','rival','hostile','war','covert') PRIMARY KEY,
  export_bucket ENUM('ally','enemy','none') NOT NULL,
  include_when_visibility ENUM('public','gmOnly','secret','any') NOT NULL DEFAULT 'any',
  note VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO fts_relationship_export_rules (status, export_bucket, include_when_visibility, note) VALUES
('allied','ally','any','Always exported to allies list.'),
('friendly','ally','any','Exported to allies list for compatibility.'),
('neutral','none','any','Not exported to allies/enemies.'),
('tense','none','any','Kept in matrix, omitted from allies/enemies.'),
('rival','enemy','any','Exported to enemies list.'),
('hostile','enemy','any','Exported to enemies list.'),
('war','enemy','any','Exported to enemies list.'),
('covert','none','gmOnly','Never exported publicly; excluded from allies/enemies.')
ON DUPLICATE KEY UPDATE
  export_bucket = VALUES(export_bucket),
  include_when_visibility = VALUES(include_when_visibility),
  note = VALUES(note);

SET FOREIGN_KEY_CHECKS = 1;

