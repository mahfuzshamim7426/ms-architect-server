const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const cors = require('cors');
const port = 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3y3ilq1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true, useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
async function run() {
    try {
        const serviceCollection = client.db('msArch').collection('services');

        // ===================services routes===========================
        app.get('/services', async (req, res) => {
            const cursor = await serviceCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/services', async (req, res) => {
            const serviceData = req.body;
            const service = await serviceCollection.insertOne(serviceData)
            res.send(service);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })


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