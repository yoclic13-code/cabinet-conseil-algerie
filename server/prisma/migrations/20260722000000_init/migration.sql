-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('superadmin', 'admin') NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pages_slug_key`(`slug`),
    INDEX `pages_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `type` ENUM('hero', 'texte', 'image-texte', 'grille-cartes', 'logos-clients', 'stats', 'cta', 'actualites', 'zones-intervention', 'contact') NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `contenu_fr` JSON NOT NULL,
    `contenu_en` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sections_page_id_ordre_idx`(`page_id`, `ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt_fr` VARCHAR(255) NULL,
    `alt_en` VARCHAR(255) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `titre_fr` VARCHAR(255) NOT NULL,
    `titre_en` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `extrait_fr` TEXT NOT NULL,
    `extrait_en` TEXT NOT NULL,
    `contenu_fr` JSON NOT NULL,
    `contenu_en` JSON NOT NULL,
    `image_couverture` VARCHAR(500) NULL,
    `categorie` VARCHAR(100) NOT NULL,
    `tags` JSON NOT NULL,
    `auteur` VARCHAR(120) NOT NULL,
    `date_publication` DATETIME(3) NULL,
    `statut` ENUM('brouillon', 'publie', 'programme') NOT NULL DEFAULT 'brouillon',
    `temps_lecture` INTEGER NOT NULL DEFAULT 1,
    `seo_title_fr` VARCHAR(70) NULL,
    `seo_title_en` VARCHAR(70) NULL,
    `seo_description_fr` VARCHAR(160) NULL,
    `seo_description_en` VARCHAR(160) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_statut_date_publication_idx`(`statut`, `date_publication`),
    INDEX `articles_categorie_idx`(`categorie`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evenements` (
    `id` VARCHAR(191) NOT NULL,
    `titre_fr` VARCHAR(255) NOT NULL,
    `titre_en` VARCHAR(255) NOT NULL,
    `description_fr` TEXT NOT NULL,
    `description_en` TEXT NOT NULL,
    `compte_rendu_fr` TEXT NULL,
    `compte_rendu_en` TEXT NULL,
    `image` VARCHAR(500) NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NULL,
    `lieu` VARCHAR(255) NOT NULL,
    `lien_inscription` VARCHAR(500) NULL,
    `statut` ENUM('a_venir', 'passe', 'annule') NOT NULL DEFAULT 'a_venir',
    `slug` VARCHAR(180) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evenements_slug_key`(`slug`),
    INDEX `evenements_statut_date_debut_idx`(`statut`, `date_debut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secteurs_activite` (
    `id` VARCHAR(191) NOT NULL,
    `nom_fr` VARCHAR(150) NOT NULL,
    `nom_en` VARCHAR(150) NOT NULL,
    `icone` VARCHAR(255) NULL,
    `description_fr` TEXT NULL,
    `description_en` TEXT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `secteurs_activite_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zones_intervention` (
    `id` VARCHAR(191) NOT NULL,
    `pays_region_fr` VARCHAR(150) NOT NULL,
    `pays_region_en` VARCHAR(150) NOT NULL,
    `description_fr` VARCHAR(500) NOT NULL,
    `description_en` VARCHAR(500) NOT NULL,
    `niveau` VARCHAR(40) NOT NULL DEFAULT 'algerie',
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `zones_intervention_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `references` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(150) NOT NULL,
    `logo` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `references_ordre_idx`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_leads` (
    `id` VARCHAR(191) NOT NULL,
    `service` VARCHAR(80) NOT NULL,
    `zone` VARCHAR(120) NOT NULL,
    `secteur` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `nom` VARCHAR(150) NOT NULL,
    `societe` VARCHAR(150) NULL,
    `email` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(40) NULL,
    `statut` ENUM('nouveau', 'traite') NOT NULL DEFAULT 'nouveau',
    `meta` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `contact_leads_statut_created_at_idx`(`statut`, `created_at`),
    INDEX `contact_leads_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seo_meta` (
    `id` VARCHAR(191) NOT NULL,
    `page_id` VARCHAR(191) NOT NULL,
    `title_fr` VARCHAR(70) NOT NULL,
    `title_en` VARCHAR(70) NOT NULL,
    `description_fr` VARCHAR(160) NOT NULL,
    `description_en` VARCHAR(160) NOT NULL,
    `og_image` VARCHAR(500) NULL,

    UNIQUE INDEX `seo_meta_page_id_key`(`page_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `nom_cabinet` VARCHAR(200) NOT NULL,
    `logo_url` VARCHAR(500) NULL,
    `baseline_fr` VARCHAR(300) NOT NULL,
    `baseline_en` VARCHAR(300) NOT NULL,
    `adresse` VARCHAR(300) NULL,
    `ville` VARCHAR(120) NULL,
    `code_postal` VARCHAR(20) NULL,
    `pays` VARCHAR(100) NULL DEFAULT 'Alg├®rie',
    `telephone` VARCHAR(40) NULL,
    `email` VARCHAR(255) NULL,
    `linkedin_url` VARCHAR(300) NULL,
    `facebook_url` VARCHAR(300) NULL,
    `twitter_url` VARCHAR(300) NULL,
    `youtube_url` VARCHAR(300) NULL,
    `google_search_console_code` VARCHAR(120) NULL,
    `google_analytics_id` VARCHAR(40) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seo_meta` ADD CONSTRAINT `seo_meta_page_id_fkey` FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

