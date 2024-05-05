const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { JsonWebTokenError } = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 5000

//midelwere
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

//genarate random serrite
//require('crypto').randomBytes(64).toString('hex')


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0zrlznh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        // Connect to the "car-doctorDB" database and access its "daatabaseCollection" collection
        const database = client.db("car-doctorDB")
        const databaseCollection = database.collection("services");
        const CollectionServicesOrder = database.collection("order");

        //auth related
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.cookie('token',token,{httpOnly:true,secure:false}).send({success:true})
            
        })


        // Services
        app.get('/services', async (req, res) => {
            console.log('--------->>', req.cookies.token)
            const services = await databaseCollection.find().toArray();
            res.json(services)
        })
        app.get('/orderreviews', async (req, res) => {
            const result = await CollectionServicesOrder.find().toArray();
            res.send(result)
        })
        app.get('/services/:id', async (req, res) => {
            const services = await databaseCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.json(services)
        })

        app.post('/services', async (req, res) => {
            const services = await databaseCollection.insertOne(req.body);
            res.json(services)
        })
        app.post('/order', async (req, res) => {
            const result = await CollectionServicesOrder.insertOne(req.body)
            res.json(result)
        })

        app.put('/services/:id', async (req, res) => {
            const services = await databaseCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
            res.json(services)
        })

        app.delete('/services/:id', async (req, res) => {
            const services = await databaseCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.json(services)
        })
        app.delete('/orderdelete/:id', async (req, res) => {
            const result = await CollectionServicesOrder.deleteOne({ _id: new ObjectId(req.params.id) })
            res.json(result)
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Car Doctor is Running...')
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})