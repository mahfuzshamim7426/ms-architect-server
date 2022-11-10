const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('msArch').collection('services');
        const reviewCollection = client.db('msArch').collection('reviews');

        // ===================jwt createtor routes===========================
        app.post('/jwt-creator', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        // ===================services routes===========================
        app.get('/services', async (req, res) => {
            const cursor = await serviceCollection.find({})
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/services', verifyJWT, async (req, res) => {
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

        // ===================reviews routes===========================
        app.get('/reviews', async (req, res) => {
            const reviewCursor = await reviewCollection.find({})
            const reviews = await reviewCursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', async (req, res) => {
            const reviewData = {
                ...req.body,
                "date": new Date(Date.now())
            };
            const review = await reviewCollection.insertOne(reviewData)
            res.send(review);
        });

        app.get('/reviews/:email', async (req, res) => {
            const emailQuery = req.params.email;
            console.log('email', emailQuery)

            const query = { email: emailQuery };
            const userReviews = await reviewCollection.find(query).sort({ date: -1 });
            const reviews = await userReviews.toArray();
            res.send(reviews);
        });

        app.get('/service-reviews/:serviceID', async (req, res) => {
            const serviceID = req.params.serviceID;
            console.log('serviceID', serviceID)
            const query = { serviceId: `${serviceID}` };
            const userReviews = await reviewCollection.find(query).sort({ date: -1 });
            const reviews = await userReviews.toArray();
            res.send(reviews);
        });

        app.put('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const bodyData = req.body;
            const option = { upsert: true };
            const updatedUser = {
                $set: {
                    text: bodyData.text,
                    name: bodyData.name,
                    rating: bodyData.rating
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, option);
            res.send(result);
        })


        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
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