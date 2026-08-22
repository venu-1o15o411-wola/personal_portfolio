ALTER TABLE `projects` ADD `metrics` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_images` ADD `kind` text DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_images` ADD `poster_url` text;
