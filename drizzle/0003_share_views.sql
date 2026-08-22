CREATE TABLE `share_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`share_id` integer NOT NULL,
	`viewed_at` integer NOT NULL,
	`page` text DEFAULT 'gallery' NOT NULL,
	`page_label` text DEFAULT '' NOT NULL,
	`country` text,
	`region` text,
	`city` text,
	`device` text,
	`browser` text,
	`referrer` text,
	FOREIGN KEY (`share_id`) REFERENCES `shares`(`id`) ON UPDATE no action ON DELETE cascade
);
