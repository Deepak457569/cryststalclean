// CryststalClean Administrator Google SSO Allowlist Provisioning Tool
// Usage: node scripts/provision-admin.mjs [email] [--remote]

import { execSync } from 'node:child_process';

async function main() {
  const args = process.argv.slice(2);
  const isRemote = args.includes('--remote');
  const cleanArgs = args.filter(a => a !== '--remote');

  const email = (cleanArgs[0] || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    console.error('Usage: node scripts/provision-admin.mjs <admin_email@example.com> [--remote]');
    process.exit(1);
  }

  console.log(`====================================================`);
  console.log(` CryststalClean Google SSO Admin Provisioning`);
  console.log(` Target Environment: ${isRemote ? 'Cloudflare Remote D1' : 'Local D1 Database'}`);
  console.log(` Administrator Email: ${email}`);
  console.log(`====================================================\n`);

  const adminId = `admin_${Date.now()}`;
  const sqlStatements = [
    `INSERT INTO administrators (id, email, role, name, updated_at) VALUES ('${adminId}', '${email}', 'admin', 'CryststalClean Executive', datetime('now')) ON CONFLICT(email) DO UPDATE SET updated_at=datetime('now');`,
    `INSERT INTO business_settings (key, value, updated_at) VALUES ('admin_allowlist', '${email}', datetime('now')) ON CONFLICT(key) DO UPDATE SET value=value || ',' || '${email}', updated_at=datetime('now');`
  ].join(' ');

  const targetFlag = isRemote ? '--remote' : '--local';
  const command = `npx wrangler d1 execute crystalclean-db ${targetFlag} --command="${sqlStatements}"`;

  try {
    console.log(`Executing D1 provisioning command...\n> ${command}\n`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    console.log(`✔ Administrator [${email}] successfully added to database & allowlist!`);
    console.log(`✔ Remember to also add this email to Wrangler secret ADMIN_EMAILS:`);
    console.log(`  npx wrangler secret put ADMIN_EMAILS`);
  } catch (err) {
    console.warn(`Wrangler D1 CLI execution output:`, err.message || err);
    console.log(`\nAlternatively, you can manually execute the following SQL in Cloudflare Dashboard:`);
    console.log(sqlStatements);
  }
}

main().catch(console.error);
