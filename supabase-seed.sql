-- ============================================================
-- Seed-Daten: Studiengänge & Module der HS Koblenz
-- ============================================================

-- Studiengänge einfügen
INSERT INTO programs (college_id, name, slug)
SELECT c.id, p.name, p.slug
FROM colleges c,
(VALUES
  ('Betriebswirtschaftslehre (BWL)', 'bwl'),
  ('Wirtschaftsinformatik', 'wirtschaftsinformatik'),
  ('Informatik', 'informatik'),
  ('Maschinenbau', 'maschinenbau'),
  ('Elektrotechnik', 'elektrotechnik'),
  ('Bauingenieurwesen', 'bauingenieurwesen'),
  ('Sozialwissenschaften', 'sozialwissenschaften'),
  ('Design', 'design')
) AS p(name, slug)
WHERE c.slug = 'hs-koblenz';

-- ============================================================
-- Module: BWL
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  ('Grundlagen der BWL', 'bwl-grundlagen', 1),
  ('Externes Rechnungswesen', 'externes-rechnungswesen', 2),
  ('Internes Rechnungswesen', 'internes-rechnungswesen', 2),
  ('Ökonomie & Wirtschaftspolitik', 'oekonomie', 1),
  ('Statistik', 'bwl-statistik', 2),
  ('Marketing', 'marketing', 3),
  ('Finanzierung & Investition', 'finanzierung-investition', 3),
  ('Unternehmensrecht', 'unternehmensrecht', 3),
  ('Controlling', 'controlling', 4),
  ('Steuerlehre', 'steuerlehre', 4),
  ('Personalmanagement', 'personalmanagement', 4),
  ('Strategisches Management', 'strategisches-management', 5)
) AS m(name, slug, semester)
WHERE p.slug = 'bwl';

-- ============================================================
-- Module: Wirtschaftsinformatik
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  ('Programmierung Grundlagen', 'wi-programmierung', 1),
  ('Datenbanken', 'wi-datenbanken', 2),
  ('Algorithmen & Datenstrukturen', 'wi-algorithmen', 2),
  ('Software Engineering', 'wi-software-engineering', 3),
  ('Wirtschaftsmathematik', 'wi-mathe', 1),
  ('BWL für Informatiker', 'wi-bwl', 1),
  ('Netzwerke & IT-Sicherheit', 'wi-netzwerke', 3),
  ('Webentwicklung', 'wi-webentwicklung', 4),
  ('ERP-Systeme', 'wi-erp', 4),
  ('Projektmanagement', 'wi-projektmanagement', 5)
) AS m(name, slug, semester)
WHERE p.slug = 'wirtschaftsinformatik';

-- ============================================================
-- Module: Informatik
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  ('Programmierung 1', 'inf-prog1', 1),
  ('Programmierung 2', 'inf-prog2', 2),
  ('Mathematik 1', 'inf-mathe1', 1),
  ('Mathematik 2', 'inf-mathe2', 2),
  ('Rechnerarchitektur', 'inf-rechnerarchitektur', 2),
  ('Betriebssysteme', 'inf-betriebssysteme', 3),
  ('Datenbanken', 'inf-datenbanken', 3),
  ('Algorithmen & Komplexität', 'inf-algorithmen', 3),
  ('Computergrafik', 'inf-computergrafik', 4),
  ('Künstliche Intelligenz', 'inf-ki', 5),
  ('Verteilte Systeme', 'inf-verteilte-systeme', 4)
) AS m(name, slug, semester)
WHERE p.slug = 'informatik';

-- ============================================================
-- Module: Maschinenbau
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  ('Technische Mechanik 1', 'mb-mechanik1', 1),
  ('Technische Mechanik 2', 'mb-mechanik2', 2),
  ('Mathematik 1', 'mb-mathe1', 1),
  ('Werkstoffkunde', 'mb-werkstoffkunde', 2),
  ('Thermodynamik', 'mb-thermodynamik', 3),
  ('Konstruktionslehre', 'mb-konstruktion', 3),
  ('Strömungslehre', 'mb-stroemungslehre', 4),
  ('Fertigungstechnik', 'mb-fertigung', 4)
) AS m(name, slug, semester)
WHERE p.slug = 'maschinenbau';
