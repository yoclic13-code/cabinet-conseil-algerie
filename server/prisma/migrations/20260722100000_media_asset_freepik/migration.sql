-- AlterTable: métadonnées licence/auteur Freepik sur media_assets
ALTER TABLE `media_assets`
    ADD COLUMN `source` VARCHAR(20) NOT NULL DEFAULT 'upload',
    ADD COLUMN `freepik_id` INTEGER NULL,
    ADD COLUMN `license_type` VARCHAR(40) NULL,
    ADD COLUMN `license_url` VARCHAR(500) NULL,
    ADD COLUMN `author_name` VARCHAR(150) NULL,
    ADD COLUMN `author_id` INTEGER NULL,
    ADD COLUMN `resource_title` VARCHAR(255) NULL,
    ADD COLUMN `resource_page_url` VARCHAR(500) NULL;

CREATE INDEX `media_assets_source_idx` ON `media_assets`(`source`);
CREATE INDEX `media_assets_freepik_id_idx` ON `media_assets`(`freepik_id`);
