ALTER TABLE `projects` RENAME COLUMN `situation` TO `walked_into`;--> statement-breakpoint
ALTER TABLE `projects` RENAME COLUMN `task` TO `the_ask`;--> statement-breakpoint
ALTER TABLE `projects` RENAME COLUMN `action` TO `the_build`;--> statement-breakpoint
ALTER TABLE `projects` RENAME COLUMN `result` TO `in_their_hands`;--> statement-breakpoint
ALTER TABLE `projects` ADD `client_note` text DEFAULT '' NOT NULL;
