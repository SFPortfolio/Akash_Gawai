const projects = {
  community: {
    label: 'PROFESSIONAL EXPERIENCE / COGNIZANT',
    title: 'Supporting the Trailblazer Community.',
    content: `<p>At Cognizant, I worked on the Salesforce Trailblazer Community project, combining technical troubleshooting, platform configuration, and knowledge sharing.</p><h3>The work</h3><ul><li>Investigate production issues, review relevant logs, and reproduce reported behavior in lower environments.</li><li>Support Salesforce user access, configuration, and Flow automation across Experience, Service, and Sales Cloud.</li><li>Coordinate with support teams and subject matter experts, document findings, and communicate next steps.</li><li>Create knowledge articles and technical guides that help users understand Salesforce functionality and common issues.</li><li>Contribute to UAT, defect triage, and release validation.</li></ul><h3>What I bring from it</h3><p>A habit of connecting the technical issue to the user’s actual experience, and turning the investigation into documentation others can use.</p><p class="dialog-notice">This is a summary of professional responsibilities. Client data, internal documents, and proprietary implementation details are not included.</p>`
  },
  flowdoctor: {
    label: 'PERSONAL PROJECT / IN DEVELOPMENT',
    title: 'FlowDoctor AI',
    content: `<p>A product concept I’m developing to help Salesforce admins investigate Flow issues with more context and less guesswork.</p><h3>The problem I want to solve</h3><p>A Flow error can be difficult to interpret without understanding the affected elements, data, and execution context. I want to make that investigation easier to follow.</p><h3>The planned MVP</h3><ul><li>Accept a Flow metadata file and a description of the issue.</li><li>Identify relevant elements and highlight possible problem areas.</li><li>Use an external AI service to explain findings and suggest investigation steps.</li><li>Produce an admin-readable report with evidence, assumptions, and validation steps.</li></ul><h3>The architecture direction</h3><p>Salesforce metadata → external analysis service → AI-assisted explanation → a reviewable diagnostic report. Human review comes before any changes to the org.</p><p class="dialog-notice">Status: early development and architecture planning. This page describes the intended product; it is not a live diagnostic service.</p>`
  },
  whatsapp: {
    label: 'PERSONAL LAB / LEARNING PROJECT',
    title: 'Salesforce × WhatsApp',
    content: `<p>A learning project exploring how Salesforce Cases could connect to WhatsApp through a Twilio sandbox.</p><h3>The direction</h3><ul><li>Send a Case-related notification from Salesforce to a sandbox WhatsApp recipient.</li><li>Practice authenticated REST callouts and Named Credentials.</li><li>Explore receiving inbound messages through a webhook and mapping them back to a Case.</li><li>Think through message history, error handling, and duplicate delivery.</li></ul><h3>What I’m learning</h3><p>The end-to-end path from a Salesforce record change to an external message, and how to bring a response back into a useful support workflow.</p><p class="dialog-notice">Status: sandbox learning and experimentation. No production messaging service or live demo is offered here.</p>`
  },
  stripe: {
    label: 'PERSONAL LAB / LEARNING PROJECT',
    title: 'Payment data, connected.',
    content: `<p>A Salesforce and Stripe learning project focused on representing payment data in Salesforce and exploring secure API connections.</p><h3>The direction</h3><ul><li>Model a custom Payment object related to an Account, including amount and status.</li><li>Practice Stripe test-mode API requests and Salesforce authentication configuration.</li><li>Explore how payment events could update the related Salesforce record.</li><li>Consider retries, event identifiers, and duplicate processing before extending the prototype.</li></ul><h3>What I’m learning</h3><p>How data modeling and integration design fit together: external identifiers, lifecycle states, and the difference between a successful request and a reliable business process.</p><p class="dialog-notice">Status: test-mode learning project. This site does not accept payments or connect to a live Stripe account.</p>`
  }
};

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  let count = 0;
  document.querySelectorAll('.work-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
}));

const dialog = document.querySelector('#project-dialog');
let lastProjectButton;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  document.querySelector('#dialog-label').textContent = project.label;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-content').innerHTML = project.content;
  lastProjectButton = button;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.scrollTop = 0;
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastProjectButton?.focus(); });

const tabs = [...document.querySelectorAll('[data-note]')];
function selectNote(button, focus = false) {
  tabs.forEach(tab => { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; document.querySelector(`#panel-${tab.dataset.note}`).hidden = !selected; });
  if (focus) button.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectNote(tab));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { e.preventDefault(); selectNote(tabs[next], true); }
  });
});

document.querySelector('.copy-email').addEventListener('click', async () => {
  const email = 'gawaiakash019@gmail.com';
  const button = document.querySelector('.copy-email');
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
    else {
      const field = document.createElement('textarea'); field.value = email; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
      const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Copy unavailable');
    }
    button.querySelector('span').textContent = 'Copied!';
    document.querySelector('#copy-status').textContent = 'Email address copied.';
    window.setTimeout(() => { button.querySelector('span').textContent = 'Copy email'; }, 2500);
  } catch {
    button.querySelector('span').textContent = 'Select email below';
    document.querySelector('#copy-status').textContent = 'Copy unavailable. Email: ' + email;
    const range = document.createRange(); range.selectNodeContents(document.querySelector('.email-address')); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  }
});
