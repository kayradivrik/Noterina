-- Notes uygulaması bulut senkronizasyonu için Supabase tablosu
-- Supabase Dashboard > SQL Editor'da bu dosyayı çalıştırın.

-- Tablo: her satır bir not (user_id ile kullanıcıya bağlı)
create table if not exists public.notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tags jsonb not null default '[]',
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  is_deleted boolean not null default false,
  icon text
);

-- Row Level Security: kullanıcı sadece kendi notlarını görür/düzenler
alter table public.notes enable row level security;

create policy "Users can do everything on own notes"
  on public.notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- İndeks (liste/sıralama için)
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);
