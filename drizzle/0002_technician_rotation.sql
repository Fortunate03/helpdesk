-- Hand-written: Drizzle does not model sequences. This is the round-robin cursor for
-- auto-assigning new requests. nextval() is atomic, so two simultaneous submissions
-- cannot be handed the same position in the rotation.
CREATE SEQUENCE IF NOT EXISTS technician_rotation;
