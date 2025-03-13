CREATE TABLE "refresh_tokens_blacklist" (
	"token" varchar(256) PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"avatar_url" varchar(256),
	"password_hash" varchar(256) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
