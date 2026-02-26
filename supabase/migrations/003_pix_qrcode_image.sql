-- ═══════════════════════════════════════════════════════════════
-- Migration 003: Suporte a imagem QR Code PIX
-- Execute no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Adiciona coluna pix_qrcode_url em pontos_doacao ──
ALTER TABLE pontos_doacao
  ADD COLUMN IF NOT EXISTS pix_qrcode_url text;

-- ── 2. Adiciona coluna pix_qrcode_url em vaquinhas ──
ALTER TABLE vaquinhas
  ADD COLUMN IF NOT EXISTS pix_qrcode_url text;

-- ── 3. Bucket de Storage para imagens QR Code ──
-- Executar apenas se o bucket não existir:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pix-qrcodes',
  'pix-qrcodes',
  true,
  524288,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;
