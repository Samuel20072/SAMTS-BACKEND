-- ============================================================================
-- MIGRACIÓN 20261110_01: Recursos Globales de SAMTS, Corrección Multitenancy
-- y Expansión Comercial del CRM.
-- ============================================================================
-- Propósito:
-- 1. Permitir que SAMTS (SUPER_ADMIN) gestione productos, promociones, posts de
--    blog y configuración de IA propios (clientId IS NULL).
-- 2. Mantener estricto aislamiento para clientes SaaS (clientId NOT NULL con FK a clients).
-- 3. Agregar campos reales de cupones (code, discountPercent) en promotions.
-- 4. Extender lead_magnet_leads con métricas comerciales (estimatedValue, dealStage,
--    assignedTo, activityHistory) para convertirlo en un CRM de alto impacto.
-- ============================================================================

BEGIN;

-- 1. Permitir recursos globales propios de SAMTS en Products (clientId NULL)
ALTER TABLE products ALTER COLUMN "clientId" DROP NOT NULL;

-- 2. Permitir recursos globales propios de SAMTS en Promotions (clientId NULL)
--    y agregar campos requeridos por el frontend y el AI Copilot
ALTER TABLE promotions ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS code character varying(50);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "discountPercent" integer;

-- 3. Permitir artículos del Blog oficial de SAMTS (clientId NULL)
ALTER TABLE blog_posts ALTER COLUMN "clientId" DROP NOT NULL;

-- 4. Permitir configuración de IA global propia de SAMTS (clientId NULL)
ALTER TABLE ai_settings ALTER COLUMN "clientId" DROP NOT NULL;

-- 5. Extender CRM (lead_magnet_leads) con gestión de oportunidades comerciales
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "estimatedValue" numeric(12,2) DEFAULT 0.00;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "assignedTo" character varying(100);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "dealStage" character varying(50);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "activityHistory" jsonb DEFAULT '[]'::jsonb;

-- 6. Índices para optimización de consultas del CRM y Dashboard
CREATE INDEX IF NOT EXISTS idx_leads_status ON lead_magnet_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON lead_magnet_leads("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON lead_magnet_leads(email);
CREATE INDEX IF NOT EXISTS idx_products_client_id ON products("clientId");
CREATE INDEX IF NOT EXISTS idx_promotions_client_id ON promotions("clientId");
CREATE INDEX IF NOT EXISTS idx_blog_posts_client_id ON blog_posts("clientId");

COMMIT;
