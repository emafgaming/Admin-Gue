const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../app/api/admin/[...slug]/route.js');
let code = fs.readFileSync(target, 'utf8');

// 1. Replace write(admin, ...) with write(auth, ...)
code = code.replace(/write\(admin,/g, 'write(auth,');

// 2. In routes array, extract auth instead of just admin where write is called
code = code.replace(/async \(\{ admin \}, (.*?)\) => write\(auth,/g, 'async (auth, $1) => write(auth,');
// Also cases without params:
code = code.replace(/async \(\{ admin \} (.*?)\) => write\(auth,/g, 'async (auth $1) => write(auth,');
code = code.replace(/async \(\{ admin, session \}, (.*?)\) => write\(auth,/g, 'async (auth, $1) => write(auth,');
code = code.replace(/async \(\{ admin \}\) => write\(auth,/g, 'async (auth) => write(auth,');

// 3. Update write function definition
const oldWrite = `function write(admin, fn) {
  const result = mutate((db) => fn(db)) || {};
  const db = getDb();
  const fresh = db.admins.find((a) => a.id === admin.id) || admin;
  return { ...result, data: svc.loadAll(db, fresh), admin: publicAdmin(fresh) };
}`;

const newWrite = `async function write(auth, fn, laravelProxy = null) {
  const { admin, session } = auth;
  let result = {};
  
  if (laravelProxy) {
     const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
     try {
       const res = await fetch(\`\${laravelUrl}\${laravelProxy.path}\`, {
         method: laravelProxy.method,
         headers: { "Authorization": \`Bearer \${session.token}\`, "Content-Type": "application/json", "Accept": "application/json" },
         body: laravelProxy.body ? JSON.stringify(laravelProxy.body) : undefined
       });
       if (res.ok) result = await res.json();
       else result = mutate((db) => fn(db)) || {};
     } catch {
       result = mutate((db) => fn(db)) || {};
     }
  } else {
     result = mutate((db) => fn(db)) || {};
  }
  
  const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  const dataRes = await fetch(\`\${laravelUrl}/admin/bff/load-all\`, {
    headers: { "Authorization": \`Bearer \${session.token}\`, "Accept": "application/json" }
  }).catch(() => null);
  
  const db = getDb();
  const fresh = db.admins.find((a) => a.id === admin.id) || admin;
  
  let data;
  if (dataRes && dataRes.ok) {
     data = (await dataRes.json()).data;
  } else {
     data = svc.loadAll(db, fresh);
  }
  
  return { ...result, data, admin: publicAdmin(fresh) };
}`;

code = code.replace(oldWrite, newWrite);

// 4. Update specific routes to pass laravelProxy!
// POST kosts/:id/status
code = code.replace(
  `async (auth, { body, params }) => write(auth, (db) => ({ kost: svc.setKostStatus(db, auth.admin, params.id, body.status, body.reason) }))`,
  `async (auth, { body, params }) => write(auth, (db) => ({ kost: svc.setKostStatus(db, auth.admin, params.id, body.status, body.reason) }), { method: 'PATCH', path: \`/admin/kosts/\${params.id}/status\`, body })`
);

// We need to carefully handle auth.admin since we changed the signature from { admin } to auth
code = code.replace(/auth\.admin\.id/g, 'auth.admin.id');
code = code.replace(/auth\.id/g, 'auth.admin.id');

// Let's just fix any instances where admin was used inside the arrow function:
// e.g. svc.createKost(db, admin, body) -> svc.createKost(db, auth.admin, body)
code = code.replace(/svc\.([A-Za-z]+)\(db, admin/g, 'svc.$1(db, auth.admin');

fs.writeFileSync(target, code);
console.log('Refactored route.js');
