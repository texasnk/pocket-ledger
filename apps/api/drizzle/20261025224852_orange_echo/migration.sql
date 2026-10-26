CREATE TABLE `Account` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`initialBalanceCents` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `AuditLog` (
	`id` text PRIMARY KEY,
	`entity` text NOT NULL,
	`action` text NOT NULL,
	`entityId` text NOT NULL,
	`snapshot` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Budget` (
	`id` text PRIMARY KEY,
	`categoryId` text NOT NULL,
	`month` text NOT NULL,
	`limitCents` integer NOT NULL,
	CONSTRAINT `fk_Budget_categoryId_Category_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `Category` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text DEFAULT '#94a3b8' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` text PRIMARY KEY,
	`description` text NOT NULL,
	`amountCents` integer NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`accountId` text NOT NULL,
	`categoryId` text,
	`transferFromAccountId` text,
	`transferToAccountId` text,
	`installmentGroupId` text,
	`installmentNumber` integer,
	`installmentTotal` integer,
	`recurrenceGroupId` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	CONSTRAINT `fk_Transaction_accountId_Account_id_fk` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`),
	CONSTRAINT `fk_Transaction_categoryId_Category_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`),
	CONSTRAINT `fk_Transaction_transferFromAccountId_Account_id_fk` FOREIGN KEY (`transferFromAccountId`) REFERENCES `Account`(`id`),
	CONSTRAINT `fk_Transaction_transferToAccountId_Account_id_fk` FOREIGN KEY (`transferToAccountId`) REFERENCES `Account`(`id`)
);
--> statement-breakpoint
CREATE INDEX `AuditLog_createdAt_idx` ON `AuditLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `AuditLog_entity_entityId_idx` ON `AuditLog` (`entity`,`entityId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Budget_categoryId_month_key` ON `Budget` (`categoryId`,`month`);--> statement-breakpoint
CREATE UNIQUE INDEX `Category_name_type_key` ON `Category` (`name`,`type`);--> statement-breakpoint
CREATE INDEX `Transaction_date_idx` ON `Transaction` (`date`);--> statement-breakpoint
CREATE INDEX `Transaction_accountId_date_idx` ON `Transaction` (`accountId`,`date`);--> statement-breakpoint
CREATE INDEX `Transaction_categoryId_date_idx` ON `Transaction` (`categoryId`,`date`);
