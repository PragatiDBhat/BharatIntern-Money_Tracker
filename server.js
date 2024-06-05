const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let db, transactionsCollection;

MongoClient.connect(process.env.MONGODB_URI)
    .then(client => {
        console.log('Connected to Database');
        db = client.db();
        
        // Create the transactions collection
        transactionsCollection = db.collection('transactions');

        // Get all transactions
        app.get('/transactions', (req, res) => {
            transactionsCollection.find().toArray()
                .then(results => {
                    res.json(results);
                })
                .catch(error => console.error(error));
        });

        // Add a new transaction
        app.post('/transactions', (req, res) => {
            const transaction = req.body;
            transactionsCollection.insertOne(transaction)
                .then(result => {
                    transaction._id = result.insertedId;
                    res.status(201).json(transaction);
                })
                .catch(error => console.error(error));
        });

        // Delete a transaction
        app.delete('/transactions/:id', (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid transaction ID' });
            }
            transactionsCollection.deleteOne({ _id: new ObjectId(id) })
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.status(404).json({ message: 'Transaction not found' });
                    }
                    res.status(204).send();
                })
                .catch(error => console.error(error));
        });

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => console.error(error));
