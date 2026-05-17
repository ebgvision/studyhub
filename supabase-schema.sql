-- ============================================================
-- EdTech Plattform – Datenbankschema für Supabase
-- ============================================================

-- Erweiterungen aktivieren
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. HOCHSCHULEN
-- ============================================================
create table colleges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Startwert: Hochschule Koblenz
insert into colleges (name, city, slug) values
  ('Hochschule Koblenz', 'Koblenz', 'hs-koblenz');

-- ============================================================
-- 2. STUDIENGÄNGE
-- ============================================================
create table programs (
  id uuid primary key default uuid_generate_v4(),
  college_id uuid references colleges(id) on delete cascade,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. MODULE
-- ============================================================
create table modules (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid references programs(id) on delete cascade,
  name text not null,
  slug text not null unique,
  semester int,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. BENUTZERPROFILE
-- (Supabase Auth erstellt den auth.users Eintrag automatisch,
--  wir speichern hier nur zusätzliche Infos)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  college_id uuid references colleges(id),
  program_id uuid references programs(id),
  created_at timestamptz default now()
);

-- Automatisch ein Profil anlegen wenn sich jemand registriert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 5. MODUL-STATISTIKEN (anonym)
-- ============================================================
create table module_stats (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references modules(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  study_days int not null,           -- Lernzeit in Tagen
  grade numeric(3,1),                -- Note z.B. 1.7, 2.3
  passed boolean not null,           -- bestanden?
  created_at timestamptz default now(),
  -- Ein User kann pro Modul nur einmal eine Statistik einreichen
  unique(module_id, user_id)
);

-- ============================================================
-- 6. CHAT-NACHRICHTEN
-- ============================================================
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references modules(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  parent_id uuid references chat_messages(id) on delete cascade, -- für verschachtelte Kommentare
  content text not null,
  like_count int default 0,
  created_at timestamptz default now()
);

-- Likes für Chat-Nachrichten
create table chat_likes (
  user_id uuid references profiles(id) on delete cascade,
  message_id uuid references chat_messages(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, message_id)
);

-- ============================================================
-- 7. LERNMATERIALIEN
-- ============================================================
create table materials (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references modules(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  file_url text,                     -- Link zum Supabase Storage
  file_type text,                    -- 'pdf', 'doc', 'link', etc.
  like_count int default 0,
  outdated_count int default 0,      -- "Veraltet"-Markierungen
  view_count int default 0,
  -- Sortierungs-Score (sinkt wenn Material als veraltet gilt)
  sort_score numeric default 0,
  is_outdated_warned boolean default false,  -- Warn-Badge aktiv?
  outdated_warned_at timestamptz,            -- Wann wurde das Badge gesetzt?
  -- Für den Semesterferien-Löschalgorithmus
  last_liked_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Likes für Lernmaterialien
create table material_likes (
  user_id uuid references profiles(id) on delete cascade,
  material_id uuid references materials(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, material_id)
);

-- "Veraltet"-Markierungen für Lernmaterialien
create table material_outdated_flags (
  user_id uuid references profiles(id) on delete cascade,
  material_id uuid references materials(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, material_id)
);

-- Aufrufe für Lernmaterialien (für den Löschalgorithmus)
create table material_views (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid references materials(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  viewed_at timestamptz default now()
);

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) – Wer darf was sehen/machen?
-- ============================================================

-- Profiles: Jeder sieht alle Profile, nur eigenes bearbeitbar
alter table profiles enable row level security;
create policy "Profile sind öffentlich lesbar" on profiles for select using (true);
create policy "User kann eigenes Profil bearbeiten" on profiles for update using (auth.uid() = id);

-- Colleges & Programs & Modules: Alle können lesen
alter table colleges enable row level security;
create policy "Hochschulen sind öffentlich" on colleges for select using (true);

alter table programs enable row level security;
create policy "Studiengänge sind öffentlich" on programs for select using (true);

alter table modules enable row level security;
create policy "Module sind öffentlich" on modules for select using (true);

-- Statistiken: Lesen für alle, schreiben nur eingeloggte User
alter table module_stats enable row level security;
create policy "Statistiken sind öffentlich lesbar" on module_stats for select using (true);
create policy "Eingeloggte User können Statistiken einreichen" on module_stats for insert with check (auth.uid() = user_id);

-- Chat: Lesen für alle, schreiben nur eingeloggte User
alter table chat_messages enable row level security;
create policy "Chat ist öffentlich lesbar" on chat_messages for select using (true);
create policy "Eingeloggte User können schreiben" on chat_messages for insert with check (auth.uid() = user_id);
create policy "User können eigene Nachrichten löschen" on chat_messages for delete using (auth.uid() = user_id);

alter table chat_likes enable row level security;
create policy "Chat-Likes lesbar" on chat_likes for select using (true);
create policy "Eingeloggte User können liken" on chat_likes for insert with check (auth.uid() = user_id);
create policy "User können eigene Likes entfernen" on chat_likes for delete using (auth.uid() = user_id);

-- Materialien: Lesen für alle, schreiben nur eingeloggte User
alter table materials enable row level security;
create policy "Materialien sind öffentlich lesbar" on materials for select using (true);
create policy "Eingeloggte User können Materialien hochladen" on materials for insert with check (auth.uid() = user_id);
create policy "User können eigene Materialien bearbeiten" on materials for update using (auth.uid() = user_id);
create policy "User können eigene Materialien löschen" on materials for delete using (auth.uid() = user_id);

alter table material_likes enable row level security;
create policy "Material-Likes lesbar" on material_likes for select using (true);
create policy "Eingeloggte User können Material liken" on material_likes for insert with check (auth.uid() = user_id);
create policy "User können eigene Material-Likes entfernen" on material_likes for delete using (auth.uid() = user_id);

alter table material_outdated_flags enable row level security;
create policy "Veraltet-Flags lesbar" on material_outdated_flags for select using (true);
create policy "Eingeloggte User können veraltet markieren" on material_outdated_flags for insert with check (auth.uid() = user_id);
create policy "User können eigene Veraltet-Flags entfernen" on material_outdated_flags for delete using (auth.uid() = user_id);

alter table material_views enable row level security;
create policy "Views lesbar" on material_views for select using (true);
create policy "Aufrufe können eingetragen werden" on material_views for insert with check (true);

-- ============================================================
-- 9. REALTIME aktivieren (für Live-Chat)
-- ============================================================
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_likes;
