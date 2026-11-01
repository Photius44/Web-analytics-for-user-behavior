const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  const projectsRes = await client.query('SELECT * FROM "Project"');
  console.log('--- PROJECTS ---');
  console.log(projectsRes.rows);
  
  if (projectsRes.rows.length > 0) {
    const projId = projectsRes.rows[0].id;
    
    const sessionsCount = await client.query('SELECT COUNT(*)::int as count FROM "Session" WHERE "projectId" = $1', [projId]);
    console.log(`\nSessions count for first project (${projId}):`, sessionsCount.rows[0].count);
    
    const eventsCount = await client.query('SELECT COUNT(*)::int as count FROM "Event" WHERE "projectId" = $1', [projId]);
    console.log(`Events count for first project (${projId}):`, eventsCount.rows[0].count);
    
    const distinctPages = await client.query('SELECT DISTINCT "pageUrl" FROM "Event" WHERE "projectId" = $1', [projId]);
    console.log('\nDistinct page URLs:', distinctPages.rows.map(r => r.pageUrl));
    
    const sampleEvents = await client.query('SELECT "eventType", "pageUrl", "payload" FROM "Event" WHERE "projectId" = $1 LIMIT 5', [projId]);
    console.log('\nSample events:');
    console.log(sampleEvents.rows);
  }
  
  await client.end();
}

main().catch(console.error);
