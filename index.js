const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors');
const port = 5000

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3y3ilq1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true, useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
async function run() {
    try {
        const userCollection = client.db('msArch').collection('users');

        app.get('/users', async (req, res) => {
            const cursor = await userCollection.find({})
            const users = await cursor.toArray();
            res.send(users);
        });

    } finally {

    }
}
run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('ms-architect node mongo crud server');
});

app.listen(port, () => {
    console.log(`ms-architect-server running on port ${port}`)
})