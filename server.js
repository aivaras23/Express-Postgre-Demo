const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON request bodies

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movies-db',
    password: 'postgres',
    port: 5432
});

// Helper function to query the database
const queryDB = async (query, params) => {
    const client = await pool.connect();
    try {
        const res = await client.query(query, params);
        return res.rows;
    } finally {
        client.release();
    }
};

// 1. CRUD for Actors

// Get all actors
app.get('/actors', async (req, res) => {
    try {
        const actors = await queryDB('SELECT * FROM actors', []);
        res.json(actors);
    } catch (err) {
        res.status(500).send('Error fetching actors');
    }
});

// Get a single actor by ID
app.get('/actors/:id', async (req, res) => {
    try {
        const actors = await queryDB('SELECT * FROM actors WHERE id = $1', [req.params.id]);
        if (actors.length === 0) {
            return res.status(404).send('Actor not found');
        }
        res.json(actors[0]);
    } catch (err) {
        res.status(500).send('Error fetching actor');
    }
});

// Create a new actor
app.post('/actors', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;

    if (new Date(dateOfBirth) > new Date()) {
        return res.status(400).send('Date of birth cannot be in the future');
    }


    const result = await queryDB(
        'INSERT INTO actors (first_name, last_name, date_of_birth) VALUES ($1, $2, $3) RETURNING *',
        [firstName, lastName, dateOfBirth]
    );
    res.status(201).json(result[0]);

});

// Update an actor
app.put('/actors/:id', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;

    if (new Date(dateOfBirth) > new Date()) {
        return res.status(400).send('Date of birth cannot be in the future');
    }

    try {
        const result = await queryDB(
            'UPDATE actors SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *',
            [firstName, lastName, dateOfBirth, req.params.id]
        );
        if (result.length === 0) {
            return res.status(404).send('Actor not found');
        }
        res.json(result[0]);
    } catch (err) {
        res.status(500).send('Error updating actor');
    }
});

// Delete an actor
app.delete('/actors/:id', async (req, res) => {
    try {
        const result = await queryDB('DELETE FROM actors WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.length === 0) {
            return res.status(404).send('Actor not found');
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error deleting actor');
    }
});

// 2. CRUD for Movies

// Get all movies
app.get('/movies', async (req, res) => {
    try {
        const movies = await queryDB('SELECT * FROM movies', []);
        res.json(movies);
    } catch (err) {
        res.status(500).send('Error fetching movies');
    }
});

// Get a single movie by ID
app.get('/movies/:id', async (req, res) => {
    try {
        const movies = await queryDB('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (movies.length === 0) {
            return res.status(404).send('Movie not found');
        }
        res.json(movies[0]);
    } catch (err) {
        res.status(500).send('Error fetching movie');
    }
});

// Create a new movie
app.post('/movies', async (req, res) => {
    const { title, creationDate, actorId } = req.body;

    try {
        // Ensure the actor exists
        const actor = await queryDB('SELECT * FROM actors WHERE id = $1', [actorId]);
        if (actor.length === 0) {
            return res.status(404).send('Actor not found');
        }

        const result = await queryDB(
            'INSERT INTO movies (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *',
            [title, creationDate, actorId]
        );
        res.status(201).json(result[0]);
    } catch (err) {
        res.status(500).send('Error creating movie');
    }
});


app.listen(port, () => {
    console.log(`Movie-Actor API running at http://localhost:${port}`);
});