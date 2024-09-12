CREATE TABLE actors (
    id SERIAL PRIMARY KEY,  -- Automatically increments for each new actor
    first_name VARCHAR(100) NOT NULL,  -- Actor's first name
    last_name VARCHAR(100) NOT NULL,  -- Actor's last name
    date_of_birth DATE NOT NULL,  -- Actor's date of birth
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When the record was created
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,  -- Automatically increments for each new movie
    title VARCHAR(255) NOT NULL,  -- Movie title
    creation_date DATE NOT NULL,  -- Movie's creation/release date
    actor_id INT REFERENCES actors(id) ON DELETE CASCADE,  -- Foreign key to `actors`, cascade delete when actor is deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When the record was created
);