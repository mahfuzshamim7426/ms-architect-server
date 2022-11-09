const express = require('express')
const app = express()
const cors = require('cors');
const port = 5000

app.use(cors());

app.listen(port, () => {
    console.log(`ms-architect-server running on port ${port}`)
})