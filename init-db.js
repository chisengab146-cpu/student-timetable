const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 1. Define the database file location
const dbPath = path.join(__dirname, 'timetable.db');

// 2. Open or create the database
const db = new Database(dbPath);

// 3. Locate and read the schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// 4. Execute the SQL instructions
db.exec(schema);

console.log('Database and tables created successfully!');

// 5. Close the database connection
db.close();