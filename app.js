const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database');
  
    // Create a table (if it doesn't exist)
    db.run(`
      CREATE TABLE IF NOT EXISTS my_table1 (
        id INTEGER PRIMARY KEY,
        date DATE,
        user TEXT,
        department TEXT,
        software TEXT,
        seats INTEGER,
        amount REAL 
      )
    `);
  });

// Function to read the CSV file and insert data into the database
const readCSVAndInsertData = (filePath) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log(row)
        const { id, date, user, department, software, seats, amount } = row;
        const insertData = db.prepare('INSERT OR REPLACE INTO my_table1 (id, date, user, department, software, seats, amount) VALUES (?, ?, ?, ?, ?, ?, ?)');
        insertData.run(id, date, user, department, software, seats, amount);
        insertData.finalize();
      })
      .on('end', () => {
        console.log('CSV file has been processed and data has been inserted into the database');
      });
  };

//   / Specify the path to your CSV file
const csvFilePath = './data.csv';

// Insert data from CSV into the database
readCSVAndInsertData(csvFilePath);

// api1
app.get('/api/total_items', async (req, res) => {
    const { start_date, end_date, department } = req.query;
  
    // Validate the required parameters
    if (!start_date || !end_date || !department) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
      
    const q3_start = start_date;
    const q3_end = new Date(end_date).toISOString();

    // Check if the specified department is 'Marketing'
    if (department.toLowerCase() !== 'marketing') {
      return res.status(400).json({ error: 'Invalid department specified' });
    }
  
    // Query the database to get the total number of seats sold in Marketing during Q3
    db.get(
      'SELECT user, date, SUM(seats) AS total_seats FROM my_table1 WHERE department = ? AND date >= ? AND date <= ?',
      [department, q3_start, q3_end],
      (err, row) => {
        if (err) {
          console.error('Error retrieving total items:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const totalSeats = row.total_seats || 0;
        res.json({ total_seats: totalSeats , data: row});
      }
    );
  });

// api 2
app.get('/api/nth_most_total_item', (req, res) => {
    
    const { item_by, start_date, end_date, n } = req.query;
    const mod_end_date = new Date(end_date).toISOString();

    let orderByColumn;
    if (item_by === 'quantity') {
      orderByColumn = 'SUM(seats)';
    } else if (item_by === 'price') {
      orderByColumn = 'SUM(seats * amount)';
    } else {
      res.status(400).json({ error: 'Invalid value for "item_by" parameter' });
      return;
    }
    
    const query = `
      SELECT software
      FROM my_table1
      WHERE date >= ? AND date <= ?
      GROUP BY software
      ORDER BY ${orderByColumn} DESC
      LIMIT ?
      OFFSET ?`;
    
    db.all(query, [start_date, mod_end_date, n, n - 1], (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      if (rows.length === 0) {
        res.status(404).json({ error: 'No items found' });
        return;
      }
    //   console.log(rows)
    //   console.log(orderByColumn)
      const itemName = rows[0].software;
      res.json({ item_name: itemName });
    });
  });

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});