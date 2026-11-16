-- ============================================================================
-- MIGRACIÓN 20261114_01: Flujo de invitaciones de lanzamiento hacia SAMTS Catalog.
-- ============================================================================
-- Propósito:
-- Extender lead_magnet_leads con el estado LOCAL de la invitación emitida vía
-- servicio-a-servicio (S2S) hacia SAMTS Catalog. El Catalog es el propietario
-- de la invitación, del token y del periodo gratuito; SAMTS solo solicita la
-- emisión y guarda el estado para el CRM.
--
-- Migración idempotente (IF NOT EXISTS, estilo 20261110_01). NO altera columnas
-- existentes, NO toca la lógica de los 5 cupos (MAX_FREE_SLOTS), ni el registro
-- público de leads ni sus endpoints.
-- ============================================================================

BEGIN;

-- Estado local de la invitación por lead
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationId" character varying(64);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationStatus" character varying(50);
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationIssuedAt" timestamp;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationSentAt" timestamp;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationActivatedAt" timestamp;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationExpiresAt" timestamp;
ALTER TABLE lead_magnet_leads ADD COLUMN IF NOT EXISTS "invitationLastError" text;

-- Índice para filtrar leads por estado de invitación en el CRM
CREATE INDEX IF NOT EXISTS idx_leads_invitation_status ON lead_magnet_leads("invitationStatus");

COMMIT;
