import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = (async () => {
	const db = await open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});

	await db.exec(`
        DROP TABLE IF EXISTS books;
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT NOT NULL,
            price REAL NOT NULL
        );
    `);

	return db;
})();

export default dbPromise;
