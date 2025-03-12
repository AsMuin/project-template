CREATE TABLE "refresh_tokens_blacklist" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" varchar(256) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "refresh_tokens_blacklist_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"password_hash" varchar(256) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
