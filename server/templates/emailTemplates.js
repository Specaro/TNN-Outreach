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

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; }
  .wrapper { max-width: 620px; margin: 0 auto; background-color: #ffffff; }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px 40px; text-align: center; }
  .header-logo-img { width: 120px; height: auto; display: block; margin: 0 auto 10px; }
  .header-tagline { color: #93c5fd; font-size: 13px; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
  .hero-banner { background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%); padding: 30px 40px; border-bottom: 3px solid #2563eb; }
  .hero-title { color: #1e3a5f; font-size: 24px; font-weight: 700; margin: 0 0 8px; line-height: 1.3; }
  .hero-subtitle { color: #3b82f6; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .body-content { padding: 35px 40px; }
  .greeting { font-size: 16px; color: #1e293b; margin: 0 0 20px; }
  .body-text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px; }
  .highlight-box { background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 20px 25px; margin: 25px 0; }
  .highlight-box h3 { color: #1e3a5f; font-size: 16px; margin: 0 0 12px; }
  .highlight-box ul { margin: 0; padding-left: 20px; color: #475569; }
  .highlight-box ul li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }
  .stats-row { display: table; width: 100%; border-collapse: separate; border-spacing: 15px; margin: 20px -15px; }
  .stat-box { display: table-cell; background: #f8fafc; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #e2e8f0; }
  .stat-number { font-size: 32px; font-weight: 800; color: #2563eb; margin: 0; }
  .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0; }
  .cta-section { text-align: center; margin: 30px 0; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff !important; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
  .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; }
  .contact-section { background: #f8fafc; border-radius: 10px; padding: 25px; margin: 25px 0; }
  .contact-section h3 { color: #1e3a5f; font-size: 15px; margin: 0 0 15px; font-weight: 700; }
  .contact-row { font-size: 14px; color: #475569; margin-bottom: 8px; }
  .contact-row strong { color: #1e293b; }
  .footer { background: #1e3a5f; padding: 30px 40px; text-align: center; }
  .footer-text { color: #93c5fd; font-size: 12px; margin: 0 0 8px; line-height: 1.6; }
  .footer-company { color: #ffffff; font-size: 14px; font-weight: 700; margin: 0 0 5px; }
  .footer-unsubscribe { color: #60a5fa; font-size: 11px; margin: 10px 0 0; }
`;

function emailWrapper(content, companyName, companyTagline) {
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
    <p class="header-tagline">${companyTagline}</p>
  </div>
  ${content}
  <div class="footer">
    <p class="footer-company">${companyName}</p>
    <p class="footer-text">
      ${companyTagline}<br>
      Connecting Healthcare Facilities with Exceptional Nursing Talent
    </p>
    <p class="footer-unsubscribe">
      You are receiving this because you are a valued partner. To update your preferences, reply to this email.
    </p>
  </div>
</div>
</body>
</html>`;
}

function introductionTemplate({ companyName, companyTagline, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="hero-banner">
    <p class="hero-subtitle">Introducing Our Services</p>
    <h1 class="hero-title">Your Trusted Partner in<br>Healthcare Staffing Excellence</h1>
  </div>
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Staffing Partner'},</p>
    <p class="body-text">
      We are excited to introduce <strong>${companyName}</strong> — a premier nurse staffing agency dedicated to
      providing your facility with highly qualified, licensed nursing professionals exactly when you need them.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Why Choose ${companyName}?</h3>
      <ul>
        <li><strong>Pre-Screened Professionals:</strong> All nurses are fully credentialed, background-checked, and skills-verified</li>
        <li><strong>24/7 Availability:</strong> Round-the-clock support and same-day placements when urgency arises</li>
        <li><strong>Flexible Staffing:</strong> Per diem, short-term, long-term, and travel nursing solutions</li>
        <li><strong>Specialties Covered:</strong> ICU, ER, Med-Surg, OR, L&D, Pediatrics, Geriatrics, and more</li>
        <li><strong>Compliance Guaranteed:</strong> Full documentation, malpractice coverage, and regulatory compliance</li>
      </ul>
    </div>
    <table class="stats-row" role="presentation">
      <tr>
        <td class="stat-box">
          <p class="stat-number">500+</p>
          <p class="stat-label">Qualified Nurses</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">24/7</p>
          <p class="stat-label">Support Team</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">98%</p>
          <p class="stat-label">Fill Rate</p>
        </td>
      </tr>
    </table>
    <p class="body-text">
      We would love the opportunity to discuss how we can support your facility's staffing needs.
      Our team is ready to build a customized staffing solution that fits your budget and scheduling requirements.
    </p>
    <div class="cta-section">
      <a href="tel:${companyPhone || ''}" class="cta-button">Call Us Today: ${companyPhone || 'Contact Us'}</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Get In Touch</h3>
      <p class="contact-row"><strong>Company:</strong> ${companyName}</p>
      ${companyPhone ? `<p class="contact-row"><strong>Phone:</strong> ${companyPhone}</p>` : ''}
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
      <p class="contact-row"><strong>Available:</strong> 24 hours a day, 7 days a week</p>
    </div>
  </div>`;
  return emailWrapper(content, companyName, companyTagline);
}

function nurseAvailabilityTemplate({ companyName, companyTagline, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="hero-banner">
    <p class="hero-subtitle">Qualified Nurses Ready Now</p>
    <h1 class="hero-title">We Have the Nurses<br>Your Facility Needs — Today</h1>
  </div>
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Staffing Coordinator'},</p>
    <p class="body-text">
      At <strong>${companyName}</strong>, we maintain a robust pool of pre-credentialed nursing professionals
      available for immediate placement. Whether you have a last-minute call-out or are planning for
      upcoming coverage needs, we are ready to help — fast.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Nurses Currently Available In These Specialties:</h3>
      <ul>
        <li>Registered Nurses (RN) — All Units</li>
        <li>Licensed Practical Nurses (LPN/LVN)</li>
        <li>Certified Nursing Assistants (CNA)</li>
        <li>Critical Care / ICU Specialists</li>
        <li>Emergency Room (ER) Nurses</li>
        <li>Operating Room (OR) Nurses</li>
        <li>Labor & Delivery (L&D) Nurses</li>
        <li>Geriatric / Long-Term Care Specialists</li>
      </ul>
    </div>
    <p class="body-text">
      Every nurse in our network is <strong>fully licensed, background-cleared, drug-tested,</strong> and
      carries their own professional liability insurance. We handle all the compliance paperwork so you can
      focus on patient care.
    </p>
    <table class="stats-row" role="presentation">
      <tr>
        <td class="stat-box">
          <p class="stat-number">4hr</p>
          <p class="stat-label">Avg Response Time</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">100%</p>
          <p class="stat-label">Credentialed</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">50+</p>
          <p class="stat-label">Specialties</p>
        </td>
      </tr>
    </table>
    <div class="cta-section">
      <a href="tel:${companyPhone || ''}" class="cta-button">Request Staff Now: ${companyPhone || 'Contact Us'}</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Contact Our Staffing Team</h3>
      <p class="contact-row"><strong>Company:</strong> ${companyName}</p>
      ${companyPhone ? `<p class="contact-row"><strong>24/7 Hotline:</strong> ${companyPhone}</p>` : ''}
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, companyName, companyTagline);
}

function seasonalStaffingTemplate({ companyName, companyTagline, companyPhone, companyWebsite, contactName, customMessage }) {
  const month = new Date().toLocaleString('default', { month: 'long' });
  const content = `
  <div class="hero-banner">
    <p class="hero-subtitle">Seasonal Staffing Alert — ${month}</p>
    <h1 class="hero-title">Prepare Your Facility for<br>Upcoming Staffing Demands</h1>
  </div>
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Administrator'},</p>
    <p class="body-text">
      As we approach the upcoming season, healthcare facilities across the country are already
      planning ahead for increased patient volumes and staff vacations. <strong>${companyName}</strong>
      is here to ensure your facility is fully staffed — no gaps, no stress.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>Plan Ahead — Lock In Your Coverage Now:</h3>
      <ul>
        <li><strong>Holiday Coverage:</strong> Guaranteed staff during peak holiday periods</li>
        <li><strong>Flu Season Surge:</strong> Rapid-response nurses for increased patient loads</li>
        <li><strong>Vacation Backfill:</strong> Reliable coverage for planned staff absences</li>
        <li><strong>PRN Pool Access:</strong> On-call nurses available with minimal notice</li>
        <li><strong>Block Scheduling:</strong> Pre-arrange weekly/monthly staffing blocks</li>
      </ul>
    </div>
    <p class="body-text">
      Our facilities that plan ahead with <strong>${companyName}</strong> consistently achieve higher
      staff-to-patient ratios, improved patient satisfaction scores, and reduced overtime costs for
      permanent staff. Don't wait until you're short-staffed — reach out today.
    </p>
    <div class="cta-section">
      <a href="tel:${companyPhone || ''}" class="cta-button">Plan Ahead — Call Us Today</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Reach Our Planning Team</h3>
      <p class="contact-row"><strong>Company:</strong> ${companyName}</p>
      ${companyPhone ? `<p class="contact-row"><strong>Phone:</strong> ${companyPhone}</p>` : ''}
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, companyName, companyTagline);
}

function partnershipTemplate({ companyName, companyTagline, companyPhone, companyWebsite, contactName, customMessage }) {
  const content = `
  <div class="hero-banner">
    <p class="hero-subtitle">Partnership Opportunity</p>
    <h1 class="hero-title">Let's Build a Stronger<br>Healthcare Community Together</h1>
  </div>
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Healthcare Leader'},</p>
    <p class="body-text">
      At <strong>${companyName}</strong>, we believe that exceptional patient care starts with
      exceptional partnerships. We're reaching out to explore how we can become your preferred
      staffing partner and deliver outstanding value to your organization.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>What Our Partnership Includes:</h3>
      <ul>
        <li><strong>Dedicated Account Manager:</strong> A single point of contact who knows your facility</li>
        <li><strong>Priority Placement:</strong> Your shifts filled before other clients</li>
        <li><strong>Custom Rate Agreements:</strong> Competitive pricing tailored to your volume</li>
        <li><strong>Quality Guarantee:</strong> 100% satisfaction or immediate replacement</li>
        <li><strong>Reporting Dashboard:</strong> Real-time staffing analytics and invoice management</li>
        <li><strong>JCAHO-Ready Staff:</strong> All nurses meet Joint Commission standards</li>
      </ul>
    </div>
    <p class="body-text">
      Our existing partners report an average <strong>35% reduction</strong> in agency staffing costs and
      a <strong>40% improvement</strong> in shift fill rates after establishing a formal partnership with us.
      We'd love to show you what's possible for your facility.
    </p>
    <div class="cta-section">
      <a href="tel:${companyPhone || ''}" class="cta-button">Schedule a Partnership Call</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>Connect With Our Partnership Team</h3>
      <p class="contact-row"><strong>Company:</strong> ${companyName}</p>
      ${companyPhone ? `<p class="contact-row"><strong>Phone:</strong> ${companyPhone}</p>` : ''}
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, companyName, companyTagline);
}

function monthlyNewsletterTemplate({ companyName, companyTagline, companyPhone, companyWebsite, contactName, customMessage }) {
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const content = `
  <div class="hero-banner">
    <p class="hero-subtitle">${month} — Partner Update</p>
    <h1 class="hero-title">Monthly Newsletter &<br>Staffing Update</h1>
  </div>
  <div class="body-content">
    <p class="greeting">Dear ${contactName || 'Valued Partner'},</p>
    <p class="body-text">
      Thank you for your continued partnership with <strong>${companyName}</strong>.
      As your trusted staffing ally, we want to keep you informed about our latest updates,
      available talent, and resources to support your facility this month.
    </p>
    ${customMessage ? `<p class="body-text">${customMessage}</p>` : ''}
    <div class="highlight-box">
      <h3>This Month's Highlights:</h3>
      <ul>
        <li><strong>New Talent Added:</strong> 50+ new RNs onboarded across all specialties this month</li>
        <li><strong>Expanded Coverage:</strong> We now serve additional metro areas across the region</li>
        <li><strong>Technology Update:</strong> New online portal for shift requests launching soon</li>
        <li><strong>Compliance Training:</strong> All staff completed latest infection control updates</li>
      </ul>
    </div>
    <p class="body-text">
      We remain committed to being your most reliable staffing partner. As always, our team is
      available around the clock to fill your critical staffing needs with speed and precision.
    </p>
    <table class="stats-row" role="presentation">
      <tr>
        <td class="stat-box">
          <p class="stat-number">98%</p>
          <p class="stat-label">On-Time Arrival</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">4.9★</p>
          <p class="stat-label">Avg. Rating</p>
        </td>
        <td class="stat-box">
          <p class="stat-number">2,000+</p>
          <p class="stat-label">Shifts Filled</p>
        </td>
      </tr>
    </table>
    <div class="cta-section">
      <a href="tel:${companyPhone || ''}" class="cta-button">Contact Your Account Manager</a>
    </div>
    <div class="divider"></div>
    <div class="contact-section">
      <h3>We're Always Here For You</h3>
      <p class="contact-row"><strong>Company:</strong> ${companyName}</p>
      ${companyPhone ? `<p class="contact-row"><strong>24/7 Line:</strong> ${companyPhone}</p>` : ''}
      ${companyWebsite ? `<p class="contact-row"><strong>Website:</strong> ${companyWebsite}</p>` : ''}
    </div>
  </div>`;
  return emailWrapper(content, companyName, companyTagline);
}

const TEMPLATE_META = [
  { id: 'introduction', name: 'Introduction Letter', description: 'Introduce your agency to new or prospective partners for the first time.', icon: '👋' },
  { id: 'nurse_availability', name: 'Nurse Availability', description: 'Let facilities know you have qualified nurses ready for immediate placement.', icon: '👩‍⚕️' },
  { id: 'seasonal_staffing', name: 'Seasonal Staffing', description: 'Remind facilities to plan ahead for seasonal surges and holiday coverage.', icon: '📅' },
  { id: 'partnership', name: 'Partnership Proposal', description: 'Propose a formal staffing partnership with exclusive benefits and pricing.', icon: '🤝' },
  { id: 'monthly_newsletter', name: 'Monthly Newsletter', description: 'Monthly update to keep existing partners engaged and informed.', icon: '📰' },
];

module.exports = { getTemplate, TEMPLATE_META };
