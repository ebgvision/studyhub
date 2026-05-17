-- ============================================================
-- WiSo Seed – Sauber strukturiert
-- Basismodule einmal, Vertiefungen pro Studiengang
-- ============================================================

-- Alte Moduldaten löschen
DELETE FROM modules;

-- ============================================================
-- 1. BASISMODULE (gültig für alle WiSo-Studiengänge)
-- ============================================================
INSERT INTO modules (id, name, slug, semester) VALUES

  -- Semester 1
  (uuid_generate_v4(), 'Angewandte Mathematik',             'wiso-b11-mathematik',       1),
  (uuid_generate_v4(), 'Informatik',                         'wiso-b12-informatik',        1),
  (uuid_generate_v4(), 'Einführung in Ökonomie und Recht',  'wiso-b13-oekonomie-recht',   1),
  (uuid_generate_v4(), 'Überfachliche Qualifikationen',     'wiso-b14-qualifikationen',   1),
  (uuid_generate_v4(), 'Externe Rechnungslegung',           'wiso-b15-rechnungslegung',   1),

  -- Semester 2
  (uuid_generate_v4(), 'Investition und Finanzierung',      'wiso-b21-investition',       2),
  (uuid_generate_v4(), 'Steuern',                           'wiso-b22-steuern',           2),
  (uuid_generate_v4(), 'Statistik und Empirie',             'wiso-b23-statistik',         2),
  (uuid_generate_v4(), 'Gesellschaftsrecht',                'wiso-b241-gesellschaftsrecht',2),
  (uuid_generate_v4(), 'International Competence',          'wiso-b25-international',     2),

  -- Semester 3
  (uuid_generate_v4(), 'Kosten- und Leistungsrechnung',     'wiso-b31-klr',               3),
  (uuid_generate_v4(), 'Marketing und Unternehmensführung', 'wiso-b32-marketing',         3),
  (uuid_generate_v4(), 'Arbeitsrecht',                      'wiso-b242-arbeitsrecht',     3),

  -- Semester 4
  (uuid_generate_v4(), 'Personalwirtschaft',                'wiso-b41-personal',          4),
  (uuid_generate_v4(), 'Controlling',                       'wiso-b42-controlling',       4),
  (uuid_generate_v4(), 'Volkswirtschaftslehre',             'wiso-b43-vwl',               4),

  -- Semester 5
  (uuid_generate_v4(), 'Obligatorische Praxisphase',        'wiso-praxis',                5),

  -- Semester 6 – Vertiefende BWL (Wahlpflicht, für alle offen)
  (uuid_generate_v4(), 'Vertiefung Marketingmanagement und Intl. Marketing',        'wiso-b6102-marketing-vertiefung',  6),
  (uuid_generate_v4(), 'Vertiefende Anwendungen im Human Resource Management',      'wiso-b6103-hrm',                   6),
  (uuid_generate_v4(), 'Vertiefung Controlling und Geschäftsprozessmanagement',     'wiso-b6104-controlling-vertiefung',6),
  (uuid_generate_v4(), 'Ethik und Entscheidung',                                    'wiso-b6119-ethik',                 6),
  (uuid_generate_v4(), 'Aktuelle Wirtschaftspolitik',                               'wiso-b6107-wirtschaftspolitik',    6),
  (uuid_generate_v4(), 'Technologiemanagement',                                     'wiso-b6113-technologie',           6),
  (uuid_generate_v4(), 'KI in der Unternehmenspraxis',                              'wiso-b6122-ki',                    6),
  (uuid_generate_v4(), 'Einführung in die Bilanzanalyse',                           'wiso-b6105-bilanzanalyse',         6),
  (uuid_generate_v4(), 'Wirtschaftliches Prüfungswesen',                            'wiso-b6110-pruefungswesen',        6),
  (uuid_generate_v4(), 'IT-Servicemanagement im Transformationsprozess',            'wiso-b6126-it-service',            6),
  (uuid_generate_v4(), 'Bachelor-Thesis',                                           'wiso-thesis',                      6),
  (uuid_generate_v4(), 'Kolloquium zur Bachelor-Thesis',                            'wiso-kolloquium',                  6);

-- ============================================================
-- 2. VERTIEFUNGSMODULE pro Studiengang
-- ============================================================

-- MFI: Management, Führung, Innovation
INSERT INTO modules (id, name, slug, semester) VALUES
  (uuid_generate_v4(), 'Grundlagen Innovation und Führung',              'mfi-am11-innovation-fuehrung',   1),
  (uuid_generate_v4(), 'Grundlagen Innovation und Geschäftsmodelle',     'mfi-am12-geschaeftsmodelle',     2),
  (uuid_generate_v4(), 'Agiles Innovations- und Projektmanagement',      'mfi-am13-projektmanagement',     3),
  (uuid_generate_v4(), 'Ethik und Organisationspsychologie',             'mfi-am14-ethik',                 3),
  (uuid_generate_v4(), 'Verpflichtendes Auslandssemester',               'mfi-ausland',                    5);

-- GuS: Gesundheits- und Sozialmanagement
INSERT INTO modules (id, name, slug, semester) VALUES
  (uuid_generate_v4(), 'Einführung in das Gesundheits- und Sozialmanagement', 'gus-ag11-einfuehrung',         1),
  (uuid_generate_v4(), 'Grundlagen der Gesundheitsökonomie',                   'gus-ag12-gesundheitsoekonomie',2),
  (uuid_generate_v4(), 'Sozialrecht, Sozialpolitik und Sozialwirtschaft',      'gus-ag13-sozialrecht',         3),
  (uuid_generate_v4(), 'Krankenhausmanagement',                                'gus-ag14-krankenhaus',         3),
  (uuid_generate_v4(), 'Organisationsentwicklung im Gesundheits- und Sozialmanagement', 'gus-ag1601-orgentwicklung', 4),
  (uuid_generate_v4(), 'Betriebliches Gesundheitsmanagement',                  'gus-ag1603-bgm',               4),
  (uuid_generate_v4(), 'Digitalisierung im Gesundheits- und Sozialwesen',      'gus-ag1604-digitalisierung',   4),
  (uuid_generate_v4(), 'Handlungs- und Methodenkompetenzen in der Gesundheits- und Sozialwirtschaft', 'gus-ag1602-methoden', 4);

-- LeB: Logistik und E-Business
INSERT INTO modules (id, name, slug, semester) VALUES
  (uuid_generate_v4(), 'Grundlagen des E-Business',                'leb-al11-ebusiness',         1),
  (uuid_generate_v4(), 'Grundlagen der Logistik',                  'leb-al12-logistik',          2),
  (uuid_generate_v4(), 'Simple Management',                         'leb-al1301-simple-mgmt',     3),
  (uuid_generate_v4(), 'Spezifisches Management in der Logistik',  'leb-al1302-mgmt-logistik',   3),
  (uuid_generate_v4(), 'Planung in der Logistik',                  'leb-al1305-planung',         3),
  (uuid_generate_v4(), 'Branchenspezifische Logistik',             'leb-al1401-branchenlogistik',4),
  (uuid_generate_v4(), 'Elektronische Marktplätze',                'leb-al1402-marktplaetze',    4),
  (uuid_generate_v4(), 'Social Media',                             'leb-al1403-social-media',    4),
  (uuid_generate_v4(), 'Transportrecht',                           'leb-al1404-transportrecht',  4),
  (uuid_generate_v4(), 'Projektarbeit Logistik und E-Business',    'leb-al15-projektarbeit',     4);

-- DBS: Digital Business und Supply Chain Management
INSERT INTO modules (id, name, slug, semester) VALUES
  (uuid_generate_v4(), 'Logistik und Supply Chain Management',          'dbs-ad11-scm',               1),
  (uuid_generate_v4(), 'Digital Business',                              'dbs-ad12-digital-business',  2),
  (uuid_generate_v4(), 'KI in der Unternehmenspraxis (DBS)',            'dbs-ad1301-ki',              3),
  (uuid_generate_v4(), 'Digital Business und Logistik im Lab',          'dbs-ad1303-lab',             3),
  (uuid_generate_v4(), 'Software Skills für die Unternehmenspraxis',    'dbs-ad1304-software',        3),
  (uuid_generate_v4(), 'Applied Machine Learning',                      'dbs-ad1307-ml',              3),
  (uuid_generate_v4(), 'Nachhaltiges Supply Chain Management',          'dbs-ad1402-nachhaltigkeit',  4),
  (uuid_generate_v4(), 'Projektmanagement klassisch und agil',          'dbs-ad1403-projektmanagement',4),
  (uuid_generate_v4(), 'Smart Factory',                                 'dbs-ad1405-smart-factory',   4),
  (uuid_generate_v4(), 'Management der digitalen Transformation',       'dbs-ad1406-transformation',  4),
  (uuid_generate_v4(), 'Digital-Ethik',                                 'dbs-ad1408-digital-ethik',   4),
  (uuid_generate_v4(), 'Applied Deep Learning',                         'dbs-ad1409-deep-learning',   4),
  (uuid_generate_v4(), 'Projektarbeit Digital Business',                'dbs-ad15-projektarbeit',     4);

-- SPM: Sportmanagement
INSERT INTO modules (id, name, slug, semester) VALUES
  (uuid_generate_v4(), 'Sozio-ökonomische Aspekte des Sports',  'spm-as11-sport-oekonomie',  1),
  (uuid_generate_v4(), 'Sport Marketing, Medien und Kommunikation', 'spm-as12-sportmarketing',2),
  (uuid_generate_v4(), 'Sportökonomische Aspekte',              'spm-as13-sportoekonomie',   3),
  (uuid_generate_v4(), 'Aspekte des Sportmanagements',          'spm-as14-sportmanagement',  3),
  (uuid_generate_v4(), 'Sportrecht',                            'spm-as15-sportrecht',       4);

-- ============================================================
-- 3. PROGRAM_MODULES: Verbindungen herstellen
-- ============================================================

-- Basismodule → alle 5 Studiengänge
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug IN ('mfi','gus','leb','dbs','spm')
  AND m.slug LIKE 'wiso-%';

-- MFI-Vertiefungen → MFI
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug = 'mfi' AND m.slug LIKE 'mfi-%';

-- GuS-Vertiefungen → GuS
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug = 'gus' AND m.slug LIKE 'gus-%';

-- LeB-Vertiefungen → LeB
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug = 'leb' AND m.slug LIKE 'leb-%';

-- DBS-Vertiefungen → DBS
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug = 'dbs' AND m.slug LIKE 'dbs-%';

-- SPM-Vertiefungen → SPM
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug = 'spm' AND m.slug LIKE 'spm-%';
