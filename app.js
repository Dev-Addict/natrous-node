const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.status(200).send('Hello from the other side :)');
});

const port = 3000;
app.listen(port, () => {
    console.log(`App is running in port${port}`);
});