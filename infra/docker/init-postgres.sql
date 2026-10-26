-- Local Docker PostgreSQL Initialization Script
-- Provisions dedicated non-superuser, non-bypassrls runtime roles on container creation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_app') THEN
    CREATE ROLE gymos_app WITH LOGIN PASSWORD 'local_app_password_change_me' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gymos_worker') THEN
    CREATE ROLE gymos_worker WITH LOGIN PASSWORD 'local_worker_password_change_me' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE gymos TO gymos_app, gymos_worker;
GRANT USAGE ON SCHEMA public TO gymos_app, gymos_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gymos_app, gymos_worker;
