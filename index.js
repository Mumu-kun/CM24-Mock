import express from "express";
import dbPromise from "./db_init.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ADD A BOOK
app.post("/api/books", async (req, res) => {
	try {
        const db = await dbPromise;
	let id = req.body.id;
	let title = req.body.title;
	let author = req.body.author;
	let genre = req.body.genre;
	let price = req.body.price;

	//implement insert
	let sql = `INSERT INTO books (id, title, author, genre, price) VALUES (?, ?, ?, ?, ?)`;
	const result = await db.run(sql, [id, title, author, genre, price]);

	res.status(201).json({
		id: id,
		title: title,
		author: author,
		genre: genre,
		price: price,
	});
        
    } catch (error) {
        console.log("error in adding a book", error);
		res.status(500).json({ error: 'Internal Server Error' });
    }
});

//UPDATE BOOK
app.put("/api/books/:id", async(req, res) => {
    try {
        const db = await dbPromise;
        let id = req.params.id;
        let title = req.body.title;
	    let author = req.body.author;
	    let genre = req.body.genre;
	    let price = req.body.price;

        let searchSql = `SELECT * FROM books WHERE id = ? ;`
        
        const getResult = await db.get(searchSql,[id]);

        //if id exists then update
        if(getResult){
            let updateSql = 
                `UPDATE books
                SET title = ?, author = ?, genre = ?, price = ?
                WHERE id = ?`;

            const updateResult = db.run(updateSql, [title, author, genre, price, id]);
            res.status(200).json({
                id: id,
		        title: title,
		        author: author,
		        genre: genre,
		        price: price,
            });
        }

        //no book with id found
        else{
            res.status(404).json({
                message: `book with id: ${id} was not found`
            });
        }
        
    } catch (error) {
        console.log("error in UPDATING BOOKS ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
});

//get a specific book by id
app.get("/api/books/:id", async (req, res) => {
	const db = await dbPromise;

	const id = req.params.id;

	try {
		const q = await db.get(
			`
			SELECT * FROM books WHERE id = ? ;
			`,[id]
		);
	
		if(q){
			res.status(200).json(q);
		}else{
			res.status(404).json({
				message: `book with id: ${id} was not found`
			})
		}
	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
	
});


// Search Books
app.get(`/api/books?`, async (req, res) => {
	try {
		const db = await dbPromise;
		console.log(req.query);


		let sql = `SELECT * FROM books`;
		const params = [];
		
		const { title, author, genre, sort, order = "ASC" } = req.query;

		// Search Fields
		const searchFieldCount = !!title + !!author + !!genre;
		if (searchFieldCount > 1) {
			return;
		}
		if (!!title) {
			sql += ` WHERE title LIKE ?`;
			params.push(title);
		} else if (!!author) {
			sql += ` WHERE author LIKE ?`;
			params.push(author);
		} else if (!!genre) {
			sql += ` WHERE genre LIKE ?`;
			params.push(genre);
		}

		// Sort Fields and Order
		if (!!sort) {
			if (["title", "author", "genre", "price"].includes(sort)) {
				sql += ` ORDER BY ? ${order}, id ASC`;
				params.push(sort);
			} else {
				return;
			}
		} else {
			sql += ` ORDER BY id ${order}`;
		}

		// Execute the query
		console.log(sql, params);
		const books = await db.all(sql, params);

		const responseJSON = {
			books: books,
		};

		// res.setHeader('content-type', 'application/json');		
		res.status(200).json(responseJSON);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: "Internal Server Error" });
	}
});


//get all books
app.get('/api/books', async (req, res) => {
	const db = await dbPromise;
	
	try {
		const q = await db.all(
			`
			SELECT * FROM books ;
			`
		);
	
		res.status(200).json({
			books: q
		});
	} catch (error) {
		console.error('error executing query: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(5000, () => {
	console.log(`Server is running on port 5000.`);
});
