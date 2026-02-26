-- ═══════════════════════════════════════════════════
-- Ajude JF — Schema do Banco de Dados
-- Rodar no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════

-- Tabela principal de registros
CREATE TABLE IF NOT EXISTS registros (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  cidade     text NOT NULL,
  tipo       text NOT NULL CHECK (tipo IN (
    'abrigo',
    'doacao',
    'desaparecido',
    'alimentacao',
    'comunidade',
    'voluntario'
  )),
  dados      jsonb NOT NULL,
  status     text DEFAULT 'pendente' CHECK (status IN (
    'pendente',
    'em_atendimento',
    'resolvido'
  ))
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_registros_tipo    ON registros(tipo);
CREATE INDEX IF NOT EXISTS idx_registros_cidade  ON registros(cidade);
CREATE INDEX IF NOT EXISTS idx_registros_status  ON registros(status);
CREATE INDEX IF NOT EXISTS idx_registros_created ON registros(created_at DESC);

-- ── RLS (Row Level Security) ──────────────────────────
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (formulário público, sem login)
CREATE POLICY "insert_publico"
  ON registros FOR INSERT
  TO anon
  WITH CHECK (true);

-- Só usuários autenticados podem ler (futuro painel admin)
CREATE POLICY "select_autenticado"
  ON registros FOR SELECT
  TO authenticated
  USING (true);

-- Só usuários autenticados podem atualizar o status
CREATE POLICY "update_autenticado"
  ON registros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
