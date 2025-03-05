// temprary to test connection to mongoDB and frontend

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

let db: any;

// MongoDB Connection
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db();
        return client;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Routes
app.get('/', (req: any, res: any) => {
    res.send('Hello, Node.js Backend!');
});

// Test connection endpoint
app.get('/api/test-connection', (req: any, res: any) => {
    res.json({ message: 'Backend connection successful!' });
});

// Create test document endpoint
app.post('/api/create-test-document', async (req: any, res: any) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const collection = db.collection('test_documents');
        const testDocument = {
            name: 'Test Document',
            createdAt: new Date(),
            randomValue: Math.floor(Math.random() * 1000)
        };

        const result = await collection.insertOne(testDocument);
        res.status(201).json({ 
            message: 'Test document created successfully',
            documentId: result.insertedId,
            document: testDocument
        });
    } catch (error) {
        console.error('Error creating test document:', error);
        res.status(500).json({ error: 'Failed to create test document' });
    }
});

// Get all test documents endpoint
app.get('/api/test-documents', async (req: any, res: any) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const collection = db.collection('test_documents');
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (error) {
        console.error('Error fetching test documents:', error);
        res.status(500).json({ error: 'Failed to fetch test documents' });
    }
});

// Start the server
async function startServer() {
    const client = await connectToMongoDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
