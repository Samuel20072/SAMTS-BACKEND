-- ============================================================================
-- MIGRACIÓN 20261112_01: Persistencia real del campo `excerpt` en blog_posts.
-- ============================================================================
-- Propósito:
-- 1. Convertir `excerpt` (resumen corto del artículo) en un campo persistente
--    de la base de datos. Hasta ahora el formulario administrativo lo exponía
--    como campo cosmético y el backend no lo almacenaba.
--
-- Características:
-- - Aditiva y no destructiva: NO elimina ni modifica datos existentes.
-- - Idempotente: puede ejecutarse más de una vez sin efectos colaterales.
-- - Compatible con PostgreSQL 16.
-- - Los registros existentes quedan con `excerpt = NULL` (sin romper consultas
--   ni publicaciones: el blog público deriva el extracto del contenido cuando
--   el campo es nulo).
-- ============================================================================

BEGIN;

-- 1. Agregar la columna `excerpt` (nullable) a blog_posts.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt text;

COMMIT;
