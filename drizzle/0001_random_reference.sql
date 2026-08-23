ALTER TABLE "tickets" ALTER COLUMN "reference" DROP DEFAULT;--> statement-breakpoint
-- Added by hand, mirroring the CREATE in 0000: references are now generated in
-- application code, so the counter this replaced is no longer used by anything.
DROP SEQUENCE IF EXISTS ticket_ref_seq;
