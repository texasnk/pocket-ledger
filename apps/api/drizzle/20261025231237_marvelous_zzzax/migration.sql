PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Account` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`initialBalanceCents` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Account`(`id`, `name`, `initialBalanceCents`, `createdAt`) SELECT `id`, `name`, `initialBalanceCents`, `createdAt` FROM `Account`;--> statement-breakpoint
DROP TABLE `Account`;--> statement-breakpoint
ALTER TABLE `__new_Account` RENAME TO `Account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_AuditLog` (
	`id` text PRIMARY KEY,
	`entity` text NOT NULL,
	`action` text NOT NULL,
	`entityId` text NOT NULL,
	`snapshot` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_AuditLog`(`id`, `entity`, `action`, `entityId`, `snapshot`, `createdAt`) SELECT `id`, `entity`, `action`, `entityId`, `snapshot`, `createdAt` FROM `AuditLog`;--> statement-breakpoint
DROP TABLE `AuditLog`;--> statement-breakpoint
ALTER TABLE `__new_AuditLog` RENAME TO `AuditLog`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Category` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text DEFAULT '#94a3b8' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Category`(`id`, `name`, `type`, `color`, `createdAt`) SELECT `id`, `name`, `type`, `color`, `createdAt` FROM `Category`;--> statement-breakpoint
DROP TABLE `Category`;--> statement-breakpoint
ALTER TABLE `__new_Category` RENAME TO `Category`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Transaction` (
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
INSERT INTO `__new_Transaction`(`id`, `description`, `amountCents`, `date`, `type`, `accountId`, `categoryId`, `transferFromAccountId`, `transferToAccountId`, `installmentGroupId`, `installmentNumber`, `installmentTotal`, `recurrenceGroupId`, `createdAt`, `updatedAt`) SELECT `id`, `description`, `amountCents`, `date`, `type`, `accountId`, `categoryId`, `transferFromAccountId`, `transferToAccountId`, `installmentGroupId`, `installmentNumber`, `installmentTotal`, `recurrenceGroupId`, `createdAt`, `updatedAt` FROM `Transaction`;--> statement-breakpoint
DROP TABLE `Transaction`;--> statement-breakpoint
ALTER TABLE `__new_Transaction` RENAME TO `Transaction`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `AuditLog_createdAt_idx` ON `AuditLog` (`createdAt`);--> statement-breakpoint
CREATE INDEX `AuditLog_entity_entityId_idx` ON `AuditLog` (`entity`,`entityId`);--> statement-breakpoint
CREATE UNIQUE INDEX `Category_name_type_key` ON `Category` (`name`,`type`);--> statement-breakpoint
CREATE INDEX `Transaction_date_idx` ON `Transaction` (`date`);--> statement-breakpoint
CREATE INDEX `Transaction_accountId_date_idx` ON `Transaction` (`accountId`,`date`);--> statement-breakpoint
CREATE INDEX `Transaction_categoryId_date_idx` ON `Transaction` (`categoryId`,`date`);