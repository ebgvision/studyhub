-- ============================================================
-- Seed: RheinAhrCampus Remagen
-- Fachbereich Wirtschafts- und Sozialwissenschaften
-- Quelle: Modulhandbücher PO 2020 / PO 2025, Stand 02.03.2026
-- ============================================================

-- Campus Remagen als eigene Hochschule eintragen
INSERT INTO colleges (name, city, slug) VALUES
  ('HS Koblenz – RheinAhrCampus', 'Remagen', 'hs-koblenz-remagen')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STUDIENGÄNGE
-- ============================================================
INSERT INTO programs (college_id, name, slug)
SELECT c.id, p.name, p.slug
FROM colleges c,
(VALUES
  ('Management, Führung, Innovation', 'mfi'),
  ('Gesundheits- und Sozialmanagement', 'gus'),
  ('Logistik und E-Business', 'leb'),
  ('Digital Business und Supply Chain Management', 'dbs'),
  ('Sportmanagement', 'spm')
) AS p(name, slug)
WHERE c.slug = 'hs-koblenz-remagen'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULE: Management, Führung, Innovation (MFI)
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  -- Semester 1 (Basismodule + studiengangspezifisch)
  ('Angewandte Mathematik', 'mfi-b11-mathematik', 1),
  ('Informatik', 'mfi-b12-informatik', 1),
  ('Einführung in Ökonomie und Recht', 'mfi-b13-oekonomie-recht', 1),
  ('Überfachliche Qualifikationen', 'mfi-b14-qualifikationen', 1),
  ('Externe Rechnungslegung', 'mfi-b15-rechnungslegung', 1),
  ('Grundlagen Innovation und Führung', 'mfi-am11-innovation-fuehrung', 1),
  -- Semester 2
  ('Investition und Finanzierung', 'mfi-b21-investition', 2),
  ('Steuern', 'mfi-b22-steuern', 2),
  ('Statistik und Empirie', 'mfi-b23-statistik', 2),
  ('Gesellschaftsrecht', 'mfi-b241-gesellschaftsrecht', 2),
  ('Grundlagen Innovation und Geschäftsmodelle', 'mfi-am12-geschaeftsmodelle', 2),
  -- Semester 3
  ('Kosten- und Leistungsrechnung', 'mfi-b31-klr', 3),
  ('Marketing und Unternehmensführung', 'mfi-b32-marketing', 3),
  ('Arbeitsrecht', 'mfi-b242-arbeitsrecht', 3),
  ('Agiles Innovations- und Projektmanagement', 'mfi-am13-projektmanagement', 3),
  ('Ethik und Organisationspsychologie', 'mfi-am14-ethik', 3),
  -- Semester 4
  ('Personalwirtschaft', 'mfi-b41-personal', 4),
  ('Controlling', 'mfi-b42-controlling', 4),
  ('Volkswirtschaftslehre', 'mfi-b43-vwl', 4),
  -- Semester 5 (Auslandssemester verpflichtend)
  ('Verpflichtendes Auslandssemester / Auslandspraktikum', 'mfi-ausland', 5),
  -- Semester 6 (Wahlpflicht + Thesis)
  ('Vertiefung Marketingmanagement und Intl. Marketing', 'mfi-b6102-marketing-vertiefung', 6),
  ('Vertiefende Anwendungen im Human Resource Management', 'mfi-b6103-hrm', 6),
  ('Vertiefung Controlling und Geschäftsprozessmanagement', 'mfi-b6104-controlling-vertiefung', 6),
  ('KI in der Unternehmenspraxis', 'mfi-b6122-ki', 6),
  ('Technologiemanagement', 'mfi-b6113-technologie', 6),
  ('Bachelor-Thesis', 'mfi-thesis', 6),
  ('Kolloquium zur Bachelor-Thesis', 'mfi-kolloquium', 6)
) AS m(name, slug, semester)
WHERE p.slug = 'mfi'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULE: Gesundheits- und Sozialmanagement (GuS)
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  -- Semester 1
  ('Angewandte Mathematik', 'gus-b11-mathematik', 1),
  ('Informatik', 'gus-b12-informatik', 1),
  ('Einführung in Ökonomie und Recht', 'gus-b13-oekonomie-recht', 1),
  ('Überfachliche Qualifikationen', 'gus-b14-qualifikationen', 1),
  ('Externe Rechnungslegung', 'gus-b15-rechnungslegung', 1),
  ('Einführung in das Gesundheits- und Sozialmanagement', 'gus-ag11-einfuehrung', 1),
  -- Semester 2
  ('Investition und Finanzierung', 'gus-b21-investition', 2),
  ('Steuern', 'gus-b22-steuern', 2),
  ('Statistik und Empirie', 'gus-b23-statistik', 2),
  ('Gesellschaftsrecht', 'gus-b241-gesellschaftsrecht', 2),
  ('Grundlagen der Gesundheitsökonomie', 'gus-ag12-gesundheitsoekonomie', 2),
  -- Semester 3
  ('Kosten- und Leistungsrechnung', 'gus-b31-klr', 3),
  ('Marketing und Unternehmensführung', 'gus-b32-marketing', 3),
  ('Arbeitsrecht', 'gus-b242-arbeitsrecht', 3),
  ('Sozialrecht, Sozialpolitik und Sozialwirtschaft', 'gus-ag13-sozialrecht', 3),
  ('Krankenhausmanagement', 'gus-ag14-krankenhausmanagement', 3),
  -- Semester 4
  ('Personalwirtschaft', 'gus-b41-personal', 4),
  ('Controlling', 'gus-b42-controlling', 4),
  ('Volkswirtschaftslehre', 'gus-b43-vwl', 4),
  ('Organisationsentwicklung im Gesundheits- und Sozialmanagement', 'gus-ag1601-orgentwicklung', 4),
  ('Betriebliches Gesundheitsmanagement', 'gus-ag1603-bgm', 4),
  ('Digitalisierung im Gesundheits- und Sozialwesen', 'gus-ag1604-digitalisierung', 4),
  -- Semester 5 (Praxisphase)
  ('Obligatorische Praxisphase', 'gus-praxis', 5),
  -- Semester 6
  ('Vertiefung Marketingmanagement und Intl. Marketing', 'gus-b6102-marketing', 6),
  ('Vertiefende Anwendungen im Human Resource Management', 'gus-b6103-hrm', 6),
  ('KI in der Unternehmenspraxis', 'gus-b6122-ki', 6),
  ('Ethik und Entscheidung', 'gus-b6119-ethik', 6),
  ('Bachelor-Thesis', 'gus-thesis', 6),
  ('Kolloquium zur Bachelor-Thesis', 'gus-kolloquium', 6)
) AS m(name, slug, semester)
WHERE p.slug = 'gus'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULE: Logistik und E-Business (LeB)
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  -- Semester 1
  ('Angewandte Mathematik', 'leb-b11-mathematik', 1),
  ('Informatik', 'leb-b12-informatik', 1),
  ('Einführung in Ökonomie und Recht', 'leb-b13-oekonomie-recht', 1),
  ('Überfachliche Qualifikationen', 'leb-b14-qualifikationen', 1),
  ('Externe Rechnungslegung', 'leb-b15-rechnungslegung', 1),
  ('Grundlagen des E-Business', 'leb-al11-ebusiness', 1),
  -- Semester 2
  ('Investition und Finanzierung', 'leb-b21-investition', 2),
  ('Steuern', 'leb-b22-steuern', 2),
  ('Statistik und Empirie', 'leb-b23-statistik', 2),
  ('Gesellschaftsrecht', 'leb-b241-gesellschaftsrecht', 2),
  ('Grundlagen der Logistik', 'leb-al12-logistik', 2),
  -- Semester 3
  ('Kosten- und Leistungsrechnung', 'leb-b31-klr', 3),
  ('Marketing und Unternehmensführung', 'leb-b32-marketing', 3),
  ('Arbeitsrecht', 'leb-b242-arbeitsrecht', 3),
  ('Simple Management', 'leb-al1301-simple-mgmt', 3),
  ('Spezifisches Management in der Logistik', 'leb-al1302-mgmt-logistik', 3),
  ('Planung in der Logistik', 'leb-al1305-planung', 3),
  -- Semester 4
  ('Personalwirtschaft', 'leb-b41-personal', 4),
  ('Controlling', 'leb-b42-controlling', 4),
  ('Volkswirtschaftslehre', 'leb-b43-vwl', 4),
  ('Branchenspezifische Logistik', 'leb-al1401-branchenlogistik', 4),
  ('Elektronische Marktplätze', 'leb-al1402-marktplaetze', 4),
  ('Social Media', 'leb-al1403-social-media', 4),
  ('Transportrecht', 'leb-al1404-transportrecht', 4),
  ('Projektarbeit', 'leb-al15-projektarbeit', 4),
  -- Semester 5 (Praxisphase)
  ('Obligatorische Praxisphase', 'leb-praxis', 5),
  -- Semester 6
  ('Vertiefung Controlling und Geschäftsprozessmanagement', 'leb-b6104-controlling', 6),
  ('KI in der Unternehmenspraxis', 'leb-b6122-ki', 6),
  ('Technologiemanagement', 'leb-b6113-technologie', 6),
  ('Bachelor-Thesis', 'leb-thesis', 6),
  ('Kolloquium zur Bachelor-Thesis', 'leb-kolloquium', 6)
) AS m(name, slug, semester)
WHERE p.slug = 'leb'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULE: Digital Business und Supply Chain Management (DBS)
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  -- Semester 1
  ('Angewandte Mathematik', 'dbs-b11-mathematik', 1),
  ('Informatik', 'dbs-b12-informatik', 1),
  ('Einführung in Ökonomie und Recht', 'dbs-b13-oekonomie-recht', 1),
  ('Überfachliche Qualifikationen', 'dbs-b14-qualifikationen', 1),
  ('Externe Rechnungslegung', 'dbs-b15-rechnungslegung', 1),
  ('Logistik und Supply Chain Management', 'dbs-ad11-scm', 1),
  -- Semester 2
  ('Investition und Finanzierung', 'dbs-b21-investition', 2),
  ('Steuern', 'dbs-b22-steuern', 2),
  ('Statistik und Empirie', 'dbs-b23-statistik', 2),
  ('Gesellschaftsrecht', 'dbs-b241-gesellschaftsrecht', 2),
  ('Digital Business', 'dbs-ad12-digital-business', 2),
  -- Semester 3
  ('Kosten- und Leistungsrechnung', 'dbs-b31-klr', 3),
  ('Marketing und Unternehmensführung', 'dbs-b32-marketing', 3),
  ('Arbeitsrecht', 'dbs-b242-arbeitsrecht', 3),
  ('KI in der Unternehmenspraxis', 'dbs-ad1301-ki', 3),
  ('Digital Business und Logistik im Lab', 'dbs-ad1303-lab', 3),
  ('Software Skills für die Unternehmenspraxis', 'dbs-ad1304-software', 3),
  ('Applied Machine Learning', 'dbs-ad1307-ml', 3),
  -- Semester 4
  ('Personalwirtschaft', 'dbs-b41-personal', 4),
  ('Controlling', 'dbs-b42-controlling', 4),
  ('Volkswirtschaftslehre', 'dbs-b43-vwl', 4),
  ('Nachhaltiges Supply Chain Management', 'dbs-ad1402-nachhaltigkeit', 4),
  ('Projektmanagement klassisch und agil', 'dbs-ad1403-projektmanagement', 4),
  ('Smart Factory', 'dbs-ad1405-smart-factory', 4),
  ('Management der digitalen Transformation', 'dbs-ad1406-transformation', 4),
  ('Digital-Ethik', 'dbs-ad1408-digital-ethik', 4),
  ('Applied Deep Learning', 'dbs-ad1409-deep-learning', 4),
  ('Projektarbeit', 'dbs-ad15-projektarbeit', 4),
  -- Semester 5 (Praxisphase)
  ('Obligatorische Praxisphase', 'dbs-praxis', 5),
  -- Semester 6
  ('Vertiefung Controlling und Geschäftsprozessmanagement', 'dbs-b6104-controlling', 6),
  ('IT-Servicemanagement im Transformationsprozess', 'dbs-b6126-it-servicemanagement', 6),
  ('Bachelor-Thesis', 'dbs-thesis', 6),
  ('Kolloquium zur Bachelor-Thesis', 'dbs-kolloquium', 6)
) AS m(name, slug, semester)
WHERE p.slug = 'dbs'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MODULE: Sportmanagement (SPM)
-- ============================================================
INSERT INTO modules (program_id, name, slug, semester)
SELECT p.id, m.name, m.slug, m.semester
FROM programs p,
(VALUES
  -- Semester 1
  ('Angewandte Mathematik', 'spm-b11-mathematik', 1),
  ('Informatik', 'spm-b12-informatik', 1),
  ('Einführung in Ökonomie und Recht', 'spm-b13-oekonomie-recht', 1),
  ('Überfachliche Qualifikationen', 'spm-b14-qualifikationen', 1),
  ('Externe Rechnungslegung', 'spm-b15-rechnungslegung', 1),
  ('Sozio-ökonomische Aspekte des Sports', 'spm-as11-sport-oekonomie', 1),
  -- Semester 2
  ('Investition und Finanzierung', 'spm-b21-investition', 2),
  ('Steuern', 'spm-b22-steuern', 2),
  ('Statistik und Empirie', 'spm-b23-statistik', 2),
  ('Gesellschaftsrecht', 'spm-b241-gesellschaftsrecht', 2),
  ('Sport Marketing, Medien und Kommunikation', 'spm-as12-sportmarketing', 2),
  -- Semester 3
  ('Kosten- und Leistungsrechnung', 'spm-b31-klr', 3),
  ('Marketing und Unternehmensführung', 'spm-b32-marketing', 3),
  ('Arbeitsrecht', 'spm-b242-arbeitsrecht', 3),
  ('Sportökonomische Aspekte', 'spm-as13-sportoekonomie', 3),
  ('Aspekte des Sportmanagements', 'spm-as14-sportmanagement', 3),
  -- Semester 4
  ('Personalwirtschaft', 'spm-b41-personal', 4),
  ('Controlling', 'spm-b42-controlling', 4),
  ('Volkswirtschaftslehre', 'spm-b43-vwl', 4),
  ('Sportrecht', 'spm-as15-sportrecht', 4),
  -- Semester 5 (Praxisphase)
  ('Obligatorische Praxisphase', 'spm-praxis', 5),
  -- Semester 6
  ('Vertiefung Marketingmanagement und Intl. Marketing', 'spm-b6102-marketing', 6),
  ('KI in der Unternehmenspraxis', 'spm-b6122-ki', 6),
  ('Wettbewerbsökonomie', 'spm-b6118-wettbewerb', 6),
  ('Bachelor-Thesis', 'spm-thesis', 6),
  ('Kolloquium zur Bachelor-Thesis', 'spm-kolloquium', 6)
) AS m(name, slug, semester)
WHERE p.slug = 'spm'
ON CONFLICT (slug) DO NOTHING;
