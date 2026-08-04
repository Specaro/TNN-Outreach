function getTemplate(templateId, data) {
  const templates = {
    introduction: introductionTemplate(data),
    nurse_availability: nurseAvailabilityTemplate(data),
    seasonal_staffing: seasonalStaffingTemplate(data),
    partnership: partnershipTemplate(data),
    monthly_newsletter: monthlyNewsletterTemplate(data),
  };
  return templates[templateId] || introductionTemplate(data);
}

const NAVY = '#1a3a6b';
const BLUE = '#2563eb';

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; }
  .wrapper { max-width: 620px; margin: 0 auto; background-color: #ffffff; }
  .header { background: #ffffff; padding: 24px 40px; text-align: center; border-bottom: 3px solid #1a3a6b; }
  .header-logo-img { width: 160px; height: auto; display: block; margin: 0 auto; }
  .hero { background: linear-gradient(135deg, #1a3a6b 0%, #2563eb 70%, #c07a6a 100%); padding: 36px 40px; text-align: center; }
  .hero-title { color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 8px; line-height: 1.3; letter-spacing: -0.5px; }
  .hero-subtitle { color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; font-weight: 500; }
  .stats-bar { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 0; display: table; width: 100%; border-collapse: collapse; }
  .stat-cell { display: table-cell; text-align: center; padding: 20px 10px; border-right: 1px solid #e2e8f0; }
  .stat-cell:last-child { border-right: none; }
  .stat-num { font-size: 28px; font-weight: 800; color: #1a3a6b; margin: 0; line-height: 1; }
  .stat-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0; }
  .body-content { padding: 36px 40px; }
  .greeting { font-size: 16px; color: #1a3a6b; font-weight: 600; margin: 0 0 16px; }
  .body-text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 18px; }
  .highlight-box { background: #eff6ff; border-left: 4px solid #1a3a6b; border-radius: 0 8px 8px 0; padding: 20px 25px; margin: 24px 0; }
  .highlight-box h3 { color: #1a3a6b; font-size: 15px; margin: 0 0 12px; font-weight: 700; }
  .highlight-box ul { margin: 0; padding-left: 20px; color: #475569; }
  .highlight-box ul li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }
  .cta-section { text-align: center; margin: 28px 0; }
  .cta-button { display: inline-block; background: #1a3a6b; color: #ffffff !important; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
  .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
  .contact-section { background: #f8fafc; border-radius: 8px; padding: 22px 25px; margin: 24px 0; border: 1px solid #e2e8f0; }
  .contact-section h3 { color: #1a3a6b; font-size: 14px; margin: 0 0 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .contact-row { font-size: 14px; color: #475569; margin-bottom: 6px; }
  .contact-row strong { color: #1a3a6b; }
  .footer { background: #1a3a6b; padding: 28px 40px; text-align: center; }
  .footer-logo { color: #ffffff; font-size: 16px; font-weight: 800; margin: 0 0 6px; letter-spacing: 1px; }
  .footer-text { color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 6px; line-height: 1.6; }
  .footer-phone { color: #93c5fd; font-size: 14px; font-weight: 600; margin: 8px 0 0; }
  .footer-unsubscribe { color: rgba(255,255,255,0.4); font-size: 11px; margin: 12px 0 0; }
`;

function statsBar() {
  return `
  <table class="stats-bar" role="presentation" width="100%">
    <tr>
      <td class="stat-cell">
        <p class="stat-num">18+</p>
        <p class="stat-lbl">Years in Business</p>
      </td>
      <td class="stat-cell">
        <p class="stat-num">450</p>
        <p class="stat-lbl">Hospitals & Clients</p>
      </td>
      <td class="stat-cell">
        <p class="stat-num">4,800</p>
        <p class="stat-lbl">Nurses Placed</p>
      </td>
      <td class="stat-cell">
        <p class="stat-num">25M+</p>
        <p class="stat-lbl">Hours Scheduled</p>
      </td>
    </tr>
  </table>`;
}

function emailWrapper(content, heroTitle, heroSub, companyName, companyPhone, companyWebsite) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
  <style>${baseStyles}</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="https://i.imgur.com/fyIsumc.jpeg" alt="Total Nurses Network" class="header-logo-img" />
  </div>
  <div class="hero">
    <h1 class="hero-title">${heroTitle}</h1>
    <p class="hero-subtitle">${heroSub}</p>
  </div>
  ${statsBar()}
  ${content}
  <div class="footer">
    <p class="footer-logo">TOTAL NURSES NETWORK</p>
    <p class="footer-text">Full-service nursing agency for hospitals and healthcare facilities.<br>Trusted by Healthcare Professionals since 2006.</p>
    ${companyPhone ? `<p class="footer-phone">${companyPhone}</p>` : '<p class="footer-phone">1.800.510.8802</p>'}
    <p class="footer-unsubscribe">You are receiving this because you are a valued partner. To update your preferences, reply to this email.</p>
  </div>
</div>
</body>
</html>`;
}

function introductionTemplate({ companyName, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Staffing Partner'},</p>
    <p class="body-text">
      Total Nurses Network provides hospitals with qualified nurses for emergency rooms, obstetrical,
      neonatal, critical care, operating rooms, and general experience nurses. Our nursing agency also
      provides nurses and nursing aides for offices, surgical centers, and nursing homes.
    </p>
    <p class="body-text">
      We serve as a full-service nursing agency for hospitals and healthcare facilities. You can always
      depend on TNN to provide the best qualified staff to meet your facility's needs.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Why Partner With TNN?</h3>
      <ul>
        <li><strong>Pre-Screened Professionals:</strong> Fully credentialed, background-checked, and skills-verified nurses</li>
        <li><strong>24/7 Availability:</strong> Round-the-clock support and same-day placements</li>
        <li><strong>Flexible Staffing:</strong> Per diem, short-term, long-term, and travel nursing solutions</li>
        <li><strong>Specialties Covered:</strong> ICU, ER, OR, OB, Neonatal, Med-Surg, Geriatrics, and more</li>
        <li><strong>Compliance Guaranteed:</strong> Full documentation, malpractice coverage, regulatory compliance</li>
      </ul>
    </div>
    <div class="cta-section">
      <a href="tel:18005108802" class="cta-button">Call Us: 1.800.510.8802</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Get In Touch</h3>
      <p class="contact-row"><strong>Phone:</strong> ${companyPhone || '1.800.510.8802'}</p>
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
      <p class="contact-row"><strong>Available:</strong> 24 hours a day, 7 days a week</p>
    </div>
  </div>`;
  return emailWrapper(content, 'Introducing Total Nurses Network', 'Your Full-Service Nursing Staffing Partner', companyName, companyPhone, companyWebsite);
}

function nurseAvailabilityTemplate({ companyName, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Staffing Coordinator'},</p>
    <p class="body-text">
      Total Nurses Network maintains a robust pool of pre-credentialed nursing professionals
      available for immediate placement. Whether you have a last-minute call-out or are planning
      upcoming coverage, we are ready to help — fast.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Nurses Available Now In These Specialties:</h3>
      <ul>
        <li>Registered Nurses (RN) — All Units</li>
        <li>Licensed Practical Nurses (LPN/LVN)</li>
        <li>Certified Nursing Assistants (CNA)</li>
        <li>Critical Care / ICU Specialists</li>
        <li>Emergency Room (ER) Nurses</li>
        <li>Operating Room (OR) &amp; Obstetrical Nurses</li>
        <li>Neonatal &amp; Labor and Delivery (L&amp;D)</li>
        <li>Geriatric / Long-Term Care Specialists</li>
      </ul>
    </div>
    <p class="body-text">
      Every nurse in our network is <strong>fully licensed, background-cleared, and drug-tested.</strong>
      We handle all compliance paperwork so you can focus entirely on patient care.
    </p>
    <div class="cta-section">
      <a href="tel:18005108802" class="cta-button">Request Staff Now: 1.800.510.8802</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Contact Our Staffing Team</h3>
      <p class="contact-row"><strong>24/7 Hotline:</strong> ${companyPhone || '1.800.510.8802'}</p>
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, 'Qualified Nurses Ready for Your Facility', 'Immediate placements available — 24/7', companyName, companyPhone, companyWebsite);
}

function seasonalStaffingTemplate({ companyName, companyPhone, companyWebsite, contactName, customMessage }) {
  const month = new Date().toLocaleString('default', { month: 'long' });
  const content = `
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Administrator'},</p>
    <p class="body-text">
      As we move into ${month}, healthcare facilities across the country are planning ahead for
      increased patient volumes and staff coverage gaps. Total Nurses Network is here to ensure
      your facility is fully staffed — no gaps, no stress.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Plan Ahead — Lock In Your Coverage Now:</h3>
      <ul>
        <li><strong>Holiday Coverage:</strong> Guaranteed staff during peak holiday periods</li>
        <li><strong>Flu Season Surge:</strong> Rapid-response nurses for increased patient loads</li>
        <li><strong>Vacation Backfill:</strong> Reliable coverage for planned staff absences</li>
        <li><strong>PRN Pool Access:</strong> On-call nurses available with minimal notice</li>
        <li><strong>Block Scheduling:</strong> Pre-arrange weekly and monthly staffing blocks</li>
      </ul>
    </div>
    <p class="body-text">
      With over <strong>25 million hours scheduled</strong> and <strong>450+ healthcare clients served</strong>,
      TNN has the experience and the talent pool to cover your facility's needs — every season.
    </p>
    <div class="cta-section">
      <a href="tel:18005108802" class="cta-button">Plan Ahead — Call 1.800.510.8802</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Reach Our Planning Team</h3>
      <p class="contact-row"><strong>Phone:</strong> ${companyPhone || '1.800.510.8802'}</p>
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, `Prepare for ${month} Staffing Needs`, 'Trusted by Healthcare Professionals for 18+ Years', companyName, companyPhone, companyWebsite);
}

function partnershipTemplate({ companyName, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Leader'},</p>
    <p class="body-text">
      Total Nurses Network addresses more than just hospital needs. For over 18 years, we have been
      the trusted staffing partner for hospitals, surgical centers, nursing homes, and outpatient
      facilities across the region.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>What a TNN Partnership Includes:</h3>
      <ul>
        <li><strong>Dedicated Account Manager:</strong> A single point of contact who knows your facility</li>
        <li><strong>Priority Placement:</strong> Your shifts filled before general requests</li>
        <li><strong>Custom Rate Agreements:</strong> Competitive pricing tailored to your volume</li>
        <li><strong>Quality Guarantee:</strong> 100% satisfaction or immediate replacement</li>
        <li><strong>JCAHO-Ready Staff:</strong> All nurses meet Joint Commission standards</li>
        <li><strong>Full Compliance:</strong> Credentialing, insurance, and documentation handled by TNN</li>
      </ul>
    </div>
    <p class="body-text">
      With <strong>4,800+ nurses placed</strong> and <strong>450+ clients served</strong>, we have the
      network and the experience to become your most reliable staffing partner.
    </p>
    <div class="cta-section">
      <a href="tel:18005108802" class="cta-button">Schedule a Partnership Call</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Connect With Our Team</h3>
      <p class="contact-row"><strong>Phone:</strong> ${companyPhone || '1.800.510.8802'}</p>
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, "Let's Build a Stronger Healthcare Community", 'Partnership opportunities with Total Nurses Network', companyName, companyPhone, companyWebsite);
}

function monthlyNewsletterTemplate({ companyName, companyPhone, companyWebsite, contactName, customMessage }) {
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const content = `
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Valued Partner'},</p>
    <p class="body-text">
      Thank you for your continued partnership with Total Nurses Network. As your trusted staffing
      ally, we want to keep you informed about our latest updates, available talent, and resources
      to support your facility this month.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>${month} Highlights:</h3>
      <ul>
        <li><strong>New Talent Added:</strong> Additional RNs onboarded across all specialties this month</li>
        <li><strong>Expanded Coverage:</strong> Serving additional facilities across the region</li>
        <li><strong>Compliance Update:</strong> All staff have completed latest regulatory training</li>
        <li><strong>Specialty Focus:</strong> Increased availability in ICU, ER, and OR specialties</li>
      </ul>
    </div>
    <p class="body-text">
      We remain committed to being your most reliable staffing partner. Our team is available
      around the clock to fill your critical staffing needs with speed and precision.
    </p>
    <div class="cta-section">
      <a href="tel:18005108802" class="cta-button">Contact Your Account Manager</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>We're Always Here For You</h3>
      <p class="contact-row"><strong>24/7 Line:</strong> ${companyPhone || '1.800.510.8802'}</p>
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, `${month} — Partner Update`, 'Monthly staffing news from Total Nurses Network', companyName, companyPhone, companyWebsite);
}

const TEMPLATE_META = [
  { id: 'introduction', name: 'Introduction Letter', description: 'Introduce TNN to new or prospective partners for the first time.', icon: '👋' },
  { id: 'nurse_availability', name: 'Nurse Availability', description: 'Let facilities know you have qualified nurses ready for immediate placement.', icon: '👩‍⚕️' },
  { id: 'seasonal_staffing', name: 'Seasonal Staffing', description: 'Remind facilities to plan ahead for seasonal surges and holiday coverage.', icon: '📅' },
  { id: 'partnership', name: 'Partnership Proposal', description: 'Propose a formal staffing partnership with exclusive benefits and pricing.', icon: '🤝' },
  { id: 'monthly_newsletter', name: 'Monthly Newsletter', description: 'Monthly update to keep existing partners engaged and informed.', icon: '📰' },
];

module.exports = { getTemplate, TEMPLATE_META };
