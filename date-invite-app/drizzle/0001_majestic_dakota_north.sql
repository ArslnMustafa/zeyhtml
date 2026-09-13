CREATE TABLE `dateSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`selectedDate` varchar(10) NOT NULL,
	`selectedTime` varchar(5) NOT NULL,
	`selections` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dateSubmissions_id` PRIMARY KEY(`id`)
);
