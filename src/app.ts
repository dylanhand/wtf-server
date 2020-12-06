import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

app.post('/test', (req, res) => {
  const { test } = req.body;
  res.send(`test: ${test}`);
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
