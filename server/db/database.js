const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../tnn_outreach.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('hospital', 'nursing_home')),
      address TEXT,
      city TEXT,
      state TEXT,
      phone TEXT,
      email TEXT,
      contact_person TEXT,
      title TEXT,
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      template_id TEXT NOT NULL,
      custom_message TEXT,
      recipient_type TEXT DEFAULT 'all',
      selected_contacts TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent')),
      recipients_count INTEGER DEFAULT 0,
      sent_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER REFERENCES campaigns(id),
      contact_id INTEGER REFERENCES contacts(id),
      contact_name TEXT,
      contact_email TEXT,
      status TEXT CHECK(status IN ('sent', 'failed')),
      error TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedContacts();
  seedDefaultSettings();
}

function seedContacts() {
  const count = db.prepare('SELECT COUNT(*) as n FROM contacts').get();
  if (count.n > 0) return;

  const hospitals = [
    { name: 'Mayo Clinic', city: 'Rochester', state: 'MN', address: '200 First St SW', phone: '(507) 284-2511', email: 'staffing@mayoclinic.org', contact_person: 'HR Director', title: 'Director of Human Resources' },
    { name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', address: '9500 Euclid Ave', phone: '(216) 444-2200', email: 'nursing.recruitment@ccf.org', contact_person: 'Nursing Recruitment', title: 'Nurse Recruiter' },
    { name: 'Johns Hopkins Hospital', city: 'Baltimore', state: 'MD', address: '1800 Orleans St', phone: '(410) 955-5000', email: 'staffing@jhmi.edu', contact_person: 'Staffing Office', title: 'Staffing Coordinator' },
    { name: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', address: '55 Fruit St', phone: '(617) 726-2000', email: 'nursing@mgh.harvard.edu', contact_person: 'Nursing Resources', title: 'Nursing Resource Manager' },
    { name: 'UCSF Medical Center', city: 'San Francisco', state: 'CA', address: '500 Parnassus Ave', phone: '(415) 476-1000', email: 'staffing@ucsf.edu', contact_person: 'Per Diem Office', title: 'Per Diem Coordinator' },
    { name: 'UCLA Medical Center', city: 'Los Angeles', state: 'CA', address: '757 Westwood Plaza', phone: '(310) 825-9111', email: 'nurserecruit@mednet.ucla.edu', contact_person: 'Nurse Recruiter', title: 'RN Recruitment Specialist' },
    { name: 'NewYork-Presbyterian Hospital', city: 'New York', state: 'NY', address: '525 E 68th St', phone: '(212) 746-5454', email: 'staffing@nyp.org', contact_person: 'Staffing Solutions', title: 'Staffing Manager' },
    { name: 'Cedars-Sinai Medical Center', city: 'Los Angeles', state: 'CA', address: '8700 Beverly Blvd', phone: '(310) 423-3277', email: 'nursing.staffing@cshs.org', contact_person: 'Agency Relations', title: 'Agency Relations Manager' },
    { name: 'Brigham and Women\'s Hospital', city: 'Boston', state: 'MA', address: '75 Francis St', phone: '(617) 732-5500', email: 'workforce@bwh.harvard.edu', contact_person: 'Workforce Solutions', title: 'Workforce Coordinator' },
    { name: 'Northwestern Memorial Hospital', city: 'Chicago', state: 'IL', address: '251 E Huron St', phone: '(312) 926-2000', email: 'nursingstaff@nm.org', contact_person: 'Nursing Staffing', title: 'Staffing Director' },
    { name: 'University of Michigan Hospitals', city: 'Ann Arbor', state: 'MI', address: '1500 E Medical Center Dr', phone: '(734) 936-4000', email: 'staffing@med.umich.edu', contact_person: 'Float Pool Office', title: 'Float Pool Manager' },
    { name: 'NYU Langone Health', city: 'New York', state: 'NY', address: '550 First Ave', phone: '(212) 263-7300', email: 'nursing@nyulangone.org', contact_person: 'Nursing Workforce', title: 'Workforce Manager' },
    { name: 'Mount Sinai Hospital', city: 'New York', state: 'NY', address: '1 Gustave L. Levy Pl', phone: '(212) 241-6500', email: 'staffing@mountsinai.org', contact_person: 'Staffing Department', title: 'Staffing Supervisor' },
    { name: 'Vanderbilt University Medical Center', city: 'Nashville', state: 'TN', address: '1211 Medical Center Dr', phone: '(615) 322-5000', email: 'nursing.staffing@vumc.org', contact_person: 'Central Staffing', title: 'Central Staffing Coordinator' },
    { name: 'Duke University Hospital', city: 'Durham', state: 'NC', address: '2301 Erwin Rd', phone: '(919) 684-8111', email: 'agencystaff@duke.edu', contact_person: 'Agency Staffing', title: 'Agency Liaison' },
    { name: 'Houston Methodist Hospital', city: 'Houston', state: 'TX', address: '6565 Fannin St', phone: '(713) 790-3311', email: 'staffing@houstonmethodist.org', contact_person: 'Staffing Office', title: 'Staffing Coordinator' },
    { name: 'Stanford Health Care', city: 'Stanford', state: 'CA', address: '300 Pasteur Dr', phone: '(650) 723-4000', email: 'nursestaff@stanfordhealthcare.org', contact_person: 'Nurse Staffing', title: 'Nurse Staffing Manager' },
    { name: 'Barnes-Jewish Hospital', city: 'St. Louis', state: 'MO', address: '1 Barnes-Jewish Hospital Plaza', phone: '(314) 747-3000', email: 'staffing@bjc.org', contact_person: 'Staffing Resources', title: 'Staffing Resource Director' },
    { name: 'UW Medical Center', city: 'Seattle', state: 'WA', address: '1959 NE Pacific St', phone: '(206) 598-3300', email: 'staffing@uw.edu', contact_person: 'Nursing Administration', title: 'Nursing Administrator' },
    { name: 'Penn Medicine', city: 'Philadelphia', state: 'PA', address: '3400 Spruce St', phone: '(215) 662-4000', email: 'nursing.workforce@pennmedicine.upenn.edu', contact_person: 'Workforce Management', title: 'Workforce Manager' },
  ];

  const nursingHomes = [
    { name: 'Sunrise Senior Living', city: 'McLean', state: 'VA', address: '7902 Westpark Dr', phone: '(703) 273-7778', email: 'staffing@sunriseseniorliving.com', contact_person: 'Executive Director', title: 'Executive Director' },
    { name: 'Brookdale Senior Living', city: 'Nashville', state: 'TN', address: '111 Westwood Pl', phone: '(615) 564-8000', email: 'staffing@brookdale.com', contact_person: 'Regional Staffing', title: 'Regional Staffing Manager' },
    { name: 'Atria Senior Living', city: 'Louisville', state: 'KY', address: '300 E Market St', phone: '(502) 568-8700', email: 'caregiving@atriaseniorliving.com', contact_person: 'Caregiver Relations', title: 'Caregiver Relations Manager' },
    { name: 'Kindred Healthcare', city: 'Louisville', state: 'KY', address: '680 S 4th St', phone: '(502) 596-7300', email: 'staffing@kindredhealthcare.com', contact_person: 'Staffing Services', title: 'Staffing Services Director' },
    { name: 'Genesis Healthcare', city: 'Kennett Square', state: 'PA', address: '101 E State St', phone: '(610) 444-6350', email: 'staffing@genesishcc.com', contact_person: 'HR Department', title: 'HR Manager' },
    { name: 'HCR ManorCare', city: 'Toledo', state: 'OH', address: '333 N Summit St', phone: '(419) 252-5500', email: 'staffing@hcr-manorcare.com', contact_person: 'Regional HR', title: 'Regional HR Director' },
    { name: 'Encompass Health', city: 'Birmingham', state: 'AL', address: '9001 Liberty Pkwy', phone: '(205) 967-7116', email: 'staffing@encompasshealth.com', contact_person: 'Staffing Coordinator', title: 'Staffing Coordinator' },
    { name: 'Benchmark Senior Living', city: 'Waltham', state: 'MA', address: '400 Fifth Ave', phone: '(781) 891-8686', email: 'workforce@benchmarkseniorliving.com', contact_person: 'Workforce Director', title: 'Workforce Director' },
    { name: 'Five Star Senior Living', city: 'Newton', state: 'MA', address: '400 Centre St', phone: '(617) 796-8387', email: 'staffing@fivestarseniorliving.com', contact_person: 'Staffing Office', title: 'Staffing Manager' },
    { name: 'Skilled Healthcare Group', city: 'Foothill Ranch', state: 'CA', address: '27442 Portola Pkwy', phone: '(949) 282-5800', email: 'staffing@skilledhealthcare.com', contact_person: 'Clinical Staffing', title: 'Clinical Staffing Director' },
    { name: 'Sun Healthcare Group', city: 'Irvine', state: 'CA', address: '18831 Von Karman Ave', phone: '(949) 255-7100', email: 'staffing@sunhealthcare.com', contact_person: 'Agency Liaison', title: 'Agency Liaison' },
    { name: 'Life Care Services', city: 'Des Moines', state: 'IA', address: '400 Locust St', phone: '(515) 875-4500', email: 'staffing@lcsnw.com', contact_person: 'Staffing Solutions', title: 'Staffing Solutions Manager' },
    { name: 'Senior Care Centers', city: 'Dallas', state: 'TX', address: '2828 W Parker Rd', phone: '(972) 781-5222', email: 'staffing@seniorcaretx.com', contact_person: 'HR Director', title: 'Director of HR' },
    { name: 'Signature HealthCARE', city: 'Louisville', state: 'KY', address: '12201 Bluegrass Pkwy', phone: '(502) 254-4100', email: 'staffing@signaturehealthcare.net', contact_person: 'Workforce Office', title: 'Workforce Manager' },
    { name: 'Consulate Health Care', city: 'Maitland', state: 'FL', address: '800 Concourse Pkwy', phone: '(407) 571-6100', email: 'staffing@consulatehealth.com', contact_person: 'Clinical Director', title: 'Director of Clinical Services' },
    { name: 'Diversicare Healthcare', city: 'Brentwood', state: 'TN', address: '1 Burton Hills Blvd', phone: '(615) 771-7575', email: 'staffing@diversicare.com', contact_person: 'Staffing Dept', title: 'Staffing Department Head' },
    { name: 'Ensign Group', city: 'San Juan Capistrano', state: 'CA', address: '27101 Puerta Real', phone: '(949) 487-9500', email: 'staffing@ensigngroup.net', contact_person: 'Clinical Staffing', title: 'Clinical Staffing Manager' },
    { name: 'National HealthCare Corp', city: 'Murfreesboro', state: 'TN', address: '100 E Vine St', phone: '(615) 890-2020', email: 'staffing@nhccare.com', contact_person: 'Staffing Coordinator', title: 'Regional Staffing Coordinator' },
    { name: 'Mariner Health Care', city: 'Sparks', state: 'MD', address: '1 Medimmune Way', phone: '(443) 545-1500', email: 'staffing@marinerhealthcare.com', contact_person: 'HR Office', title: 'HR Coordinator' },
    { name: 'Trilogy Health Services', city: 'Louisville', state: 'KY', address: '303 N Hurstbourne Pkwy', phone: '(502) 413-1390', email: 'staffing@trilogyhs.com', contact_person: 'Workforce Director', title: 'Director of Workforce Development' },
  ];

  const insertContact = db.prepare(`
    INSERT INTO contacts (name, type, address, city, state, phone, email, contact_person, title)
    VALUES (@name, @type, @address, @city, @state, @phone, @email, @contact_person, @title)
  `);

  const insertMany = db.transaction((contacts, type) => {
    for (const c of contacts) {
      insertContact.run({ ...c, type });
    }
  });

  insertMany(hospitals, 'hospital');
  insertMany(nursingHomes, 'nursing_home');
}

function seedDefaultSettings() {
  const existing = db.prepare('SELECT COUNT(*) as n FROM settings').get();
  if (existing.n > 0) return;

  const insert = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  const defaults = [
    ['smtp_host', 'smtp.gmail.com'],
    ['smtp_port', '587'],
    ['smtp_secure', 'false'],
    ['smtp_user', ''],
    ['smtp_pass', ''],
    ['from_name', 'TNN Staffing Solutions'],
    ['from_email', ''],
    ['company_name', 'TNN Staffing Solutions'],
    ['company_phone', ''],
    ['company_website', ''],
    ['company_tagline', 'Your Trusted Partner in Healthcare Staffing'],
  ];
  for (const [key, value] of defaults) {
    insert.run(key, value);
  }
}

module.exports = { getDb };
