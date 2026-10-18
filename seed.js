const Database = require('better-sqlite3');
const path = require('path');

// 1. Connect to our existing database
const dbPath = path.join(__dirname, 'timetable.db');
const db = new Database(dbPath);

// 2. Prepare an SQL command to insert a timetable record
const insert = db.prepare(`
    INSERT INTO timetable (
        course_code,
        course_name,
        day_of_week,
        start_time,
        end_time,
        location,
        goal
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// 3. Create our 10 sample timetable records
const records = [
    ['CS101', 'Introduction to Programming', 'Monday', '08:00', '10:00', 'Lab 1', 'Practise Java programming'],
    ['MA101', 'Calculus', 'Monday', '10:00', '12:00', 'Room A1', 'Improve problem-solving skills'],
    ['IT101', 'Computer Systems', 'Tuesday', '08:00', '10:00', 'Room B2', 'Understand computer hardware'],
    ['CS102', 'Data Structures', 'Tuesday', '10:00', '12:00', 'Lab 2', 'Practise data structures'],
    ['ST101', 'Statistics', 'Wednesday', '08:00', '10:00', 'Room C1', 'Solve probability problems'],
    ['WT101', 'Web Technologies', 'Wednesday', '10:00', '12:00', 'Lab 1', 'Build a functional website'],
    ['DB101', 'Database Systems', 'Thursday', '08:00', '10:00', 'Room D1', 'Practise SQL queries'],
    ['NW101', 'Computer Networks', 'Thursday', '10:00', '12:00', 'Room B1', 'Understand network protocols'],
    ['SE101', 'Software Engineering', 'Friday', '08:00', '10:00', 'Room A2', 'Learn software development methods'],
    ['PH101', 'Physics', 'Friday', '10:00', '12:00', 'Room C2', 'Practise physics calculations']
];

// 4. Insert the records into the database
const insertMany = db.transaction((records) => {
    for (const record of records) {
        insert.run(...record);
    }
});

insertMany(records);

console.log('10 sample timetable records inserted successfully!');

// 5. Close the database connection
db.close();