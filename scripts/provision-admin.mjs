// CrystalClean One-Time Administrator Provisioning & Password Setup Tool
// Usage: node scripts/provision-admin.mjs [email] [password] [--remote]

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

// Password hashing using WebCrypto PBKDF2 with SHA-256 (identical to worker/auth.ts)
async function hashPassword(password) {
  const saltBytes = crypto.randomBytes(16);
  const salt = saltBytes.toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const hash = derivedKey.toString('hex');
  return { hash, salt };
}

async function main() {
  const args = process.argv.slice(2);
  const isRemote = args.includes('--remote');
  const cleanArgs = args.filter(a => a !== '--remote');

  const email = (cleanArgs[0] || 'admin@crystalclean.in').trim().toLowerCase();
  const password = cleanArgs[1] || 'CrystalCleanAdmin2026!';

  if (password.length < 8) {
    console.error('Error: Administrator password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log(`====================================================`);
  console.log(` CrystalClean Secure Administrator Provisioning`);
  console.log(` Target Environment: ${isRemote ? 'Cloudflare Remote D1' : 'Local D1 Database'}`);
  console.log(` Administrator Email: ${email}`);
  console.log(`====================================================\n`);

  const { hash, salt } = await hashPassword(password);
  const adminId = `admin_${Date.now()}`;

  const sqlStatements = [
    `INSERT INTO administrators (id, email, password_hash, salt, role, name, updated_at) VALUES ('${adminId}', '${email}', '${hash}', '${salt}', 'admin', 'CrystalClean Executive', datetime('now')) ON CONFLICT(email) DO UPDATE SET password_hash='${hash}', salt='${salt}', updated_at=datetime('now');`,
    `INSERT INTO business_settings (key, value, updated_at) VALUES ('admin_allowlist', '${email}', datetime('now')) ON CONFLICT(key) DO UPDATE SET value='${email}', updated_at=datetime('now');`
  ].join(' ');

  console.log('PBKDF2 hash generated with 100,000 iterations (HMAC-SHA256).');

  const targetFlag = isRemote ? '--remote' : '--local';
  const command = `npx wrangler d1 execute crystalclean-db ${targetFlag} --command="${sqlStatements}"`;

  try {
    console.log(`Executing D1 provisioning command...\n> ${command}\n`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    console.log(`✔ Administrator [${email}] successfully provisioned!`);
    console.log(`✔ Allowlist updated to include [${email}].`);
    console.log(`✔ You can now sign in at /admin/login using your email and password.`);
  } catch (err) {
    console.warn(`Wrangler D1 CLI execution output:`, err.message || err);
    console.log(`\nAlternatively, you can manually execute the following SQL in Cloudflare Dashboard:`);
    console.log(sqlStatements);
  }
}

main().catch(console.error);
