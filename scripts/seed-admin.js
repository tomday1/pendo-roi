// scripts/seed-admin.js
// Run with: node --env-file=.env.local scripts/seed-admin.js
import { createClient } from '@supabase/supabase-js';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

// ---- Setup admin client (server-side only) ----
const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

// One admin client (service-role) is all we need
const admin = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- Small prompt helpers ----
const rl = readline.createInterface({ input, output });

function ask(prompt) {
  return new Promise((resolve) => rl.question(prompt, (ans) => resolve(ans.trim())));
}

// Minimal hidden input (works in most terminals)
function askHidden(prompt) {
  return new Promise((resolve) => {
    output.write(prompt);
    const onData = (char) => {
      char = String(char);
      if (char === '\n' || char === '\r' || char === '\u0004') {
        output.write('\n');
        input.off('data', onData);
        resolve(buffer);
      } else if (char === '\u0003') {
        process.exit(1); // Ctrl+C
      } else {
        output.write('*');
        buffer += char;
      }
    };
    let buffer = '';
    input.on('data', onData);
  });
}

async function askChoice(prompt, choices, defIdx = 0) {
  const menu = choices.map((c, i) => `  ${i + 1}) ${c}`).join('\n');
  const ans = await ask(`${prompt}\n${menu}\nChoose [${defIdx + 1}]: `);
  const idx = ans ? parseInt(ans, 10) - 1 : defIdx;
  return choices[Math.max(0, Math.min(choices.length - 1, idx))];
}

// ---- Supabase helpers ----
async function ensureUser(email, password, fullName) {
  // listUsers is fine for seed scripts (small scale)
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;
  const found = list.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (found) return { id: found.id, email: found.email };

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return { id: data.user.id, email: data.user.email };
}

async function upsertProfile({ id, email, fullName }) {
  const { error } = await admin.from('profiles').upsert(
    [{ id, email, full_name: fullName }],
    { onConflict: 'id' }
  );
  if (error) throw error;
}

async function listCustomerNames() {
  const { data, error } = await admin.from('customers').select('id, name').order('name');
  if (error) throw error;
  return data || [];
}

async function upsertCustomer(name, createdByUserId) {
  const { data, error } = await admin
    .from('customers')
    .upsert([{ name, created_by: createdByUserId }], { onConflict: 'name' })
    .select('id, name')
    .single();
  if (error) throw error;
  return data;
}

async function grantAccess(userId, customerId, role) {
  const { error } = await admin
    .from('customer_access')
    .upsert([{ user_id: userId, customer_id: customerId, role }], {
      onConflict: 'user_id,customer_id',
    });
  if (error) throw error;
}

async function insertStarterPreset(customerId, createdBy) {
  const { data: existing, error: readErr } = await admin
    .from('customer_presets')
    .select('id')
    .eq('customer_id', customerId)
    .limit(1);
  if (readErr) throw readErr;
  if (existing?.length) return;

  const starter = {
    version: 1,
    currency: 'GBP',
    pboFilter: 'All',
    enabled: { analytics: true, onboarding: true },
  };

  const { error } = await admin
    .from('customer_presets')
    .insert([{ customer_id: customerId, data: starter, version: 1, created_by: createdBy }]);
  if (error) throw error;
}

// ---- Main interactive flow ----
async function addOneUserFlow() {
  output.write('\n=== Add / Grant Access to a User ===\n');
  const fullName = await ask('Full name: ');
  const email = await ask('Email: ');
  const password = await askHidden('Temp password (input hidden): ');

  const user = await ensureUser(email, password, fullName);
  await upsertProfile({ id: user.id, email: user.email, fullName });

  while (true) {
    const existing = await listCustomerNames();
    const names = existing.map((c) => c.name);
    const choice = await askChoice(
      '\nPick a customer or choose "New customer"...',
      [...names, 'New customer…'],
      0
    );

    let customer;
    if (choice === 'New customer…') {
      const newName = await ask('New customer name: ');
      customer = await upsertCustomer(newName, user.id);
      output.write(`Created customer "${customer.name}" (${customer.id}).\n`);
    } else {
      customer = existing.find((c) => c.name === choice);
      output.write(`Selected customer "${customer.name}".\n`);
    }

    const role = await askChoice('Grant role', ['viewer', 'editor', 'owner'], 1);
    await grantAccess(user.id, customer.id, role);
    output.write(`Granted ${role} to ${email} for "${customer.name}".\n`);

    const addPreset = await ask('Insert starter preset for this customer? [y/N]: ');
    if (/^y(es)?$/i.test(addPreset)) {
      await insertStarterPreset(customer.id, user.id);
      output.write('Starter preset inserted.\n');
    }

    const moreCust = await ask('Grant this user access to another customer? [y/N]: ');
    if (!/^y(es)?$/i.test(moreCust)) break;
  }
}

async function main() {
  try {
    while (true) {
      await addOneUserFlow();
      const again = await ask('\nAdd another user? [y/N]: ');
      if (!/^y(es)?$/i.test(again)) break;
    }
    output.write('\n✅ Done.\n');
  } catch (e) {
    console.error('\nSeed failed:', e);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
