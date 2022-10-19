CREATE TABLE IF NOT EXISTS "source" (
	"id"	INTEGER NOT NULL,
	"source_url"	REAL NOT NULL,
	"video_source_url"	TEXT,
	"request_id"	TEXT,
	"status"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
