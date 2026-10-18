// ======================================================
// 1. IMPORT THE TOOLS WE NEED
// ======================================================

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// ======================================================
// 2. CREATE THE EXPRESS APPLICATION
// ======================================================

const app = express();

// ======================================================
// 3. CONFIGURE MIDDLEWARE
// ======================================================

// Allow cross-origin requests during development.
app.use(cors());

// Allow Express to read JSON request bodies.
app.use(express.json());

// Serve HTML, CSS, and JavaScript from the frontend folder.
app.use(express.static(path.join(__dirname, '../frontend')));

// ======================================================
// 4. CONNECT TO THE SQLITE DATABASE
// ======================================================

const dbPath = path.join(__dirname, 'timetable.db');

const db = new Database(dbPath);

// ======================================================
// 5. INITIALIZE THE DATABASE
// ======================================================

// Read the database schema.
const schemaPath = path.join(__dirname, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');

// Create the table if it does not already exist.
db.exec(schema);

console.log('Database table is ready!');

// ======================================================
// 6. INSERT SAMPLE DATA IF THE TABLE IS EMPTY
// ======================================================

const recordCount = db.prepare(
    'SELECT COUNT(*) AS total FROM timetable'
).get().total;

if (recordCount === 0) {

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

    const records = [
        [
            'CS101',
            'Introduction to Programming',
            'Monday',
            '08:00',
            '10:00',
            'Lab 1',
            'Practise Java programming'
        ],
        [
            'MA101',
            'Calculus',
            'Monday',
            '10:00',
            '12:00',
            'Room A1',
            'Improve problem-solving skills'
        ],
        [
            'IT101',
            'Computer Systems',
            'Tuesday',
            '08:00',
            '10:00',
            'Room B2',
            'Understand computer hardware'
        ],
        [
            'CS102',
            'Data Structures',
            'Tuesday',
            '10:00',
            '12:00',
            'Lab 2',
            'Practise data structures'
        ],
        [
            'ST101',
            'Statistics',
            'Wednesday',
            '08:00',
            '10:00',
            'Room C1',
            'Solve probability problems'
        ],
        [
            'WT101',
            'Web Technologies',
            'Wednesday',
            '10:00',
            '12:00',
            'Lab 1',
            'Build a functional website'
        ],
        [
            'DB101',
            'Database Systems',
            'Thursday',
            '08:00',
            '10:00',
            'Room D1',
            'Practise SQL queries'
        ],
        [
            'NW101',
            'Computer Networks',
            'Thursday',
            '10:00',
            '12:00',
            'Room B1',
            'Understand network protocols'
        ],
        [
            'SE101',
            'Software Engineering',
            'Friday',
            '08:00',
            '10:00',
            'Room A2',
            'Learn software development methods'
        ],
        [
            'PH101',
            'Physics',
            'Friday',
            '10:00',
            '12:00',
            'Room C2',
            'Practise physics calculations'
        ]
    ];

    const insertMany = db.transaction((items) => {
        for (const record of items) {
            insert.run(...record);
        }
    });

    insertMany(records);

    console.log('10 sample timetable records inserted!');

} else {

    console.log(
        `Database already contains ${recordCount} records. Seeding skipped.`
    );

}

// ======================================================
// 7. GET ALL TIMETABLE RECORDS
// ======================================================

app.get('/api/timetable', (req, res) => {

    try {

        const timetable = db.prepare(`
            SELECT *
            FROM timetable
            ORDER BY day_of_week, start_time
        `).all();

        res.json(timetable);

    } catch (error) {

        console.error('Error retrieving timetable:', error);

        res.status(500).json({
            error: 'Failed to retrieve timetable'
        });

    }

});

// ======================================================
// 8. GET ONE TIMETABLE RECORD BY ID
// ======================================================

app.get('/api/timetable/:id', (req, res) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'ID must be a positive integer'
            });
        }

        const timetable = db.prepare(`
            SELECT *
            FROM timetable
            WHERE id = ?
        `).get(id);

        if (!timetable) {
            return res.status(404).json({
                error: 'Timetable record not found'
            });
        }

        res.json(timetable);

    } catch (error) {

        console.error('Error retrieving timetable record:', error);

        res.status(500).json({
            error: 'Failed to retrieve timetable record'
        });

    }

});

// ======================================================
// 9. CREATE A NEW TIMETABLE RECORD
// ======================================================

app.post('/api/timetable', (req, res) => {

    try {

        const {
            course_code,
            course_name,
            day_of_week,
            start_time,
            end_time,
            location,
            goal
        } = req.body;

        if (
            !course_code ||
            !course_name ||
            !day_of_week ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                error: 'Please provide all required fields'
            });
        }

        const result = db.prepare(`
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
        `).run(
            course_code,
            course_name,
            day_of_week,
            start_time,
            end_time,
            location || null,
            goal || null
        );

        const newTimetable = db.prepare(`
            SELECT *
            FROM timetable
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json(newTimetable);

    } catch (error) {

        console.error('Error creating timetable record:', error);

        res.status(500).json({
            error: 'Failed to create timetable record'
        });

    }

});

// ======================================================
// 10. UPDATE AN EXISTING TIMETABLE RECORD
// ======================================================

app.put('/api/timetable/:id', (req, res) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'ID must be a positive integer'
            });
        }

        const {
            course_code,
            course_name,
            day_of_week,
            start_time,
            end_time,
            location,
            goal
        } = req.body;

        if (
            !course_code ||
            !course_name ||
            !day_of_week ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                error: 'Please provide all required fields'
            });
        }

        const result = db.prepare(`
            UPDATE timetable
            SET
                course_code = ?,
                course_name = ?,
                day_of_week = ?,
                start_time = ?,
                end_time = ?,
                location = ?,
                goal = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            course_code,
            course_name,
            day_of_week,
            start_time,
            end_time,
            location || null,
            goal || null,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Timetable record not found'
            });
        }

        const updatedTimetable = db.prepare(`
            SELECT *
            FROM timetable
            WHERE id = ?
        `).get(id);

        res.json(updatedTimetable);

    } catch (error) {

        console.error('Error updating timetable record:', error);

        res.status(500).json({
            error: 'Failed to update timetable record'
        });

    }

});

// ======================================================
// 11. DELETE A TIMETABLE RECORD
// ======================================================

app.delete('/api/timetable/:id', (req, res) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                error: 'ID must be a positive integer'
            });
        }

        const result = db.prepare(`
            DELETE FROM timetable
            WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Timetable record not found'
            });
        }

        res.json({
            message: 'Timetable record deleted successfully',
            id: id
        });

    } catch (error) {

        console.error('Error deleting timetable record:', error);

        res.status(500).json({
            error: 'Failed to delete timetable record'
        });

    }

});

// ======================================================
// 12. HANDLE UNKNOWN API ROUTES
// ======================================================

app.use('/api', (req, res) => {

    res.status(404).json({
        error: 'API endpoint not found'
    });

});

// ======================================================
// 13. START THE SERVER
// ======================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

});