-- Create the default "postgres" role so external probes/clients that
-- connect with default credentials don't get FATAL errors.
-- The app itself uses the "contaux" user (see docker-compose env).
CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'contaux123';
