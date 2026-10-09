-- Conexões OAuth do Google (Calendar, Drive, Tasks, Sheets, Docs, Forms, Ads)
CREATE TABLE google_connections (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  scope TEXT,
  google_email TEXT,
  google_name TEXT,
  google_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
