-- ============================================================
-- WiSo Seed v2 – Korrekte Modul-Typen
-- basis      = B-Module, Pflicht für ALLE WiSo-Studiengänge
-- wahlpflicht = B25.x International Competence, eine davon wählen
-- spezifisch  = AM/AG/AL/AD/AS-Module, nur jeweiliger Studiengang
-- ============================================================

DELETE FROM program_modules;
DELETE FROM modules;

-- ============================================================
-- BASIS-MODULE (B-Module) – Pflicht für alle 5 Studiengänge
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES

  -- Semester 1
  (uuid_generate_v4(), 'Angewandte Mathematik',            'b11-mathematik',        1, 'basis'),
  (uuid_generate_v4(), 'Informatik',                        'b12-informatik',         1, 'basis'),
  (uuid_generate_v4(), 'Einführung in Ökonomie und Recht', 'b13-oekonomie-recht',    1, 'basis'),
  (uuid_generate_v4(), 'Überfachliche Qualifikationen',    'b14-qualifikationen',    1, 'basis'),
  (uuid_generate_v4(), 'Externe Rechnungslegung',          'b15-rechnungslegung',    1, 'basis'),

  -- Semester 2
  (uuid_generate_v4(), 'Investition und Finanzierung',     'b21-investition',        2, 'basis'),
  (uuid_generate_v4(), 'Steuern',                          'b22-steuern',            2, 'basis'),
  (uuid_generate_v4(), 'Statistik und Empirie',            'b23-statistik',          2, 'basis'),
  (uuid_generate_v4(), 'Gesellschaftsrecht',               'b241-gesellschaftsrecht',2, 'basis'),

  -- Semester 3
  (uuid_generate_v4(), 'Kosten- und Leistungsrechnung',    'b31-klr',                3, 'basis'),
  (uuid_generate_v4(), 'Marketing und Unternehmensführung','b32-marketing',          3, 'basis'),
  (uuid_generate_v4(), 'Arbeitsrecht',                     'b242-arbeitsrecht',      3, 'basis'),

  -- Semester 4
  (uuid_generate_v4(), 'Personalwirtschaft',               'b41-personal',           4, 'basis'),
  (uuid_generate_v4(), 'Controlling',                      'b42-controlling',        4, 'basis'),
  (uuid_generate_v4(), 'Volkswirtschaftslehre',            'b43-vwl',                4, 'basis'),

  -- Semester 5
  (uuid_generate_v4(), 'Obligatorische Praxisphase',       'b-praxis',               5, 'basis'),

  -- Semester 6 – Vertiefende BWL (Wahlpflicht, für alle offen)
  (uuid_generate_v4(), 'Vertiefung Marketingmanagement und Intl. Marketing',       'b6102-marketing-vertiefung',  6, 'basis'),
  (uuid_generate_v4(), 'Vertiefende Anwendungen im Human Resource Management',     'b6103-hrm',                   6, 'basis'),
  (uuid_generate_v4(), 'Vertiefung Controlling und Geschäftsprozessmanagement',    'b6104-controlling-vertiefung',6, 'basis'),
  (uuid_generate_v4(), 'Ethik und Entscheidung',                                   'b6119-ethik',                 6, 'basis'),
  (uuid_generate_v4(), 'Aktuelle Wirtschaftspolitik',                              'b6107-wirtschaftspolitik',    6, 'basis'),
  (uuid_generate_v4(), 'Technologiemanagement',                                    'b6113-technologie',           6, 'basis'),
  (uuid_generate_v4(), 'KI in der Unternehmenspraxis',                             'b6122-ki',                    6, 'basis'),
  (uuid_generate_v4(), 'Einführung in die Bilanzanalyse',                          'b6105-bilanzanalyse',         6, 'basis'),
  (uuid_generate_v4(), 'Wirtschaftliches Prüfungswesen',                           'b6110-pruefungswesen',        6, 'basis'),
  (uuid_generate_v4(), 'IT-Servicemanagement im Transformationsprozess',           'b6126-it-service',            6, 'basis'),
  (uuid_generate_v4(), 'Bachelor-Thesis',                                          'b-thesis',                    6, 'basis'),
  (uuid_generate_v4(), 'Kolloquium zur Bachelor-Thesis',                           'b-kolloquium',                6, 'basis');

-- ============================================================
-- WAHLPFLICHT B25 – International Competence (eine wählen)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'International Competence: Business and Communication',    'b2501-business-comm',    2, 'wahlpflicht'),
  (uuid_generate_v4(), 'International Competence: Language and Business Culture', 'b2502-language-culture', 2, 'wahlpflicht'),
  (uuid_generate_v4(), 'International Competence: Languages',                     'b2503-languages',        2, 'wahlpflicht'),
  (uuid_generate_v4(), 'International Competence: Working Internationally',       'b2504-working-intl',     2, 'wahlpflicht'),
  (uuid_generate_v4(), 'International Competence: Asia',                          'b2505-asia',             2, 'wahlpflicht'),
  (uuid_generate_v4(), 'International Competence: Europe',                        'b2506-europe',           2, 'wahlpflicht');

-- ============================================================
-- SPEZIFISCHE MODULE – MFI (Management, Führung, Innovation)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'Grundlagen Innovation und Führung',            'am11-innovation-fuehrung',  1, 'spezifisch'),
  (uuid_generate_v4(), 'Grundlagen Innovation und Geschäftsmodelle',   'am12-geschaeftsmodelle',    2, 'spezifisch'),
  (uuid_generate_v4(), 'Agiles Innovations- und Projektmanagement',    'am13-projektmanagement',    3, 'spezifisch'),
  (uuid_generate_v4(), 'Ethik und Organisationspsychologie',           'am14-ethik-orgpsych',       3, 'spezifisch'),
  (uuid_generate_v4(), 'Verpflichtendes Auslandssemester',             'am-ausland',                5, 'spezifisch');

-- ============================================================
-- SPEZIFISCHE MODULE – GuS (Gesundheits- und Sozialmanagement)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'Einführung in das Gesundheits- und Sozialmanagement',           'ag11-einfuehrung-gus',       1, 'spezifisch'),
  (uuid_generate_v4(), 'Grundlagen der Gesundheitsökonomie',                            'ag12-gesundheitsoekonomie',  2, 'spezifisch'),
  (uuid_generate_v4(), 'Sozialrecht, Sozialpolitik und Sozialwirtschaft',               'ag13-sozialrecht',           3, 'spezifisch'),
  (uuid_generate_v4(), 'Krankenhausmanagement',                                         'ag14-krankenhaus',           3, 'spezifisch'),
  (uuid_generate_v4(), 'Organisationsentwicklung im Gesundheits- und Sozialmanagement', 'ag1601-orgentwicklung',      4, 'spezifisch'),
  (uuid_generate_v4(), 'Handlungs- und Methodenkompetenzen GuS',                        'ag1602-methoden-gus',        4, 'spezifisch'),
  (uuid_generate_v4(), 'Betriebliches Gesundheitsmanagement',                           'ag1603-bgm',                 4, 'spezifisch'),
  (uuid_generate_v4(), 'Digitalisierung im Gesundheits- und Sozialwesen',               'ag1604-digitalisierung-gus', 4, 'spezifisch');

-- ============================================================
-- SPEZIFISCHE MODULE – LeB (Logistik und E-Business)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'Grundlagen des E-Business',               'al11-ebusiness',          1, 'spezifisch'),
  (uuid_generate_v4(), 'Grundlagen der Logistik',                 'al12-logistik',           2, 'spezifisch'),
  (uuid_generate_v4(), 'Simple Management',                       'al1301-simple-mgmt',      3, 'spezifisch'),
  (uuid_generate_v4(), 'Spezifisches Management in der Logistik', 'al1302-mgmt-logistik',    3, 'spezifisch'),
  (uuid_generate_v4(), 'Planung in der Logistik',                 'al1305-planung-logistik', 3, 'spezifisch'),
  (uuid_generate_v4(), 'Branchenspezifische Logistik',            'al1401-branchenlogistik', 4, 'spezifisch'),
  (uuid_generate_v4(), 'Elektronische Marktplätze',               'al1402-marktplaetze',     4, 'spezifisch'),
  (uuid_generate_v4(), 'Social Media',                            'al1403-social-media',     4, 'spezifisch'),
  (uuid_generate_v4(), 'Transportrecht',                          'al1404-transportrecht',   4, 'spezifisch'),
  (uuid_generate_v4(), 'Projektarbeit Logistik und E-Business',   'al15-projektarbeit-leb',  4, 'spezifisch');

-- ============================================================
-- SPEZIFISCHE MODULE – DBS (Digital Business & Supply Chain)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'Logistik und Supply Chain Management',       'ad11-scm',               1, 'spezifisch'),
  (uuid_generate_v4(), 'Digital Business',                           'ad12-digital-business',  2, 'spezifisch'),
  (uuid_generate_v4(), 'KI in der Unternehmenspraxis (DBS)',         'ad1301-ki-dbs',          3, 'spezifisch'),
  (uuid_generate_v4(), 'Digital Business und Logistik im Lab',       'ad1303-lab',             3, 'spezifisch'),
  (uuid_generate_v4(), 'Software Skills für die Unternehmenspraxis', 'ad1304-software-skills', 3, 'spezifisch'),
  (uuid_generate_v4(), 'Applied Machine Learning',                   'ad1307-ml',              3, 'spezifisch'),
  (uuid_generate_v4(), 'Nachhaltiges Supply Chain Management',       'ad1402-nachhaltigkeit',  4, 'spezifisch'),
  (uuid_generate_v4(), 'Projektmanagement klassisch und agil',       'ad1403-projektmgmt-dbs', 4, 'spezifisch'),
  (uuid_generate_v4(), 'Smart Factory',                              'ad1405-smart-factory',   4, 'spezifisch'),
  (uuid_generate_v4(), 'Management der digitalen Transformation',    'ad1406-transformation',  4, 'spezifisch'),
  (uuid_generate_v4(), 'Digital-Ethik',                              'ad1408-digital-ethik',   4, 'spezifisch'),
  (uuid_generate_v4(), 'Applied Deep Learning',                      'ad1409-deep-learning',   4, 'spezifisch'),
  (uuid_generate_v4(), 'Projektarbeit Digital Business',             'ad15-projektarbeit-dbs', 4, 'spezifisch');

-- ============================================================
-- SPEZIFISCHE MODULE – SPM (Sportmanagement)
-- ============================================================
INSERT INTO modules (id, name, slug, semester, module_type) VALUES
  (uuid_generate_v4(), 'Sozio-ökonomische Aspekte des Sports',       'as11-sport-oekonomie',  1, 'spezifisch'),
  (uuid_generate_v4(), 'Sport Marketing, Medien und Kommunikation',  'as12-sportmarketing',   2, 'spezifisch'),
  (uuid_generate_v4(), 'Sportökonomische Aspekte',                   'as13-sportoekonomie',   3, 'spezifisch'),
  (uuid_generate_v4(), 'Aspekte des Sportmanagements',               'as14-sportmanagement',  3, 'spezifisch'),
  (uuid_generate_v4(), 'Sportrecht',                                 'as15-sportrecht',       4, 'spezifisch');

-- ============================================================
-- PROGRAM_MODULES – Verbindungen herstellen
-- ============================================================

-- Alle B-Module (basis + wahlpflicht) → alle 5 Studiengänge
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id
FROM programs p, modules m
WHERE p.slug IN ('mfi','gus','leb','dbs','spm')
  AND m.module_type IN ('basis','wahlpflicht');

-- MFI spezifische Module
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id FROM programs p, modules m
WHERE p.slug = 'mfi' AND m.slug LIKE 'am%';

-- GuS spezifische Module
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id FROM programs p, modules m
WHERE p.slug = 'gus' AND m.slug LIKE 'ag%';

-- LeB spezifische Module
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id FROM programs p, modules m
WHERE p.slug = 'leb' AND m.slug LIKE 'al%';

-- DBS spezifische Module
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id FROM programs p, modules m
WHERE p.slug = 'dbs' AND m.slug LIKE 'ad%';

-- SPM spezifische Module
INSERT INTO program_modules (program_id, module_id)
SELECT p.id, m.id FROM programs p, modules m
WHERE p.slug = 'spm' AND m.slug LIKE 'as%';
