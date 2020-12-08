import express from 'express';
import bodyParser from 'body-parser';

type BlogPostBody = {
  title: string;
  date: string;
  body: string;
  tags: [string];
  commitMessage: string;
}

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

app.post('/publish', (req, res) => {
  const post: BlogPostBody = req.body;
  // TODO:
  // 1. create a markdown file with the post body and attributes
  // 2. move the file to blog path  (get path from env file)
  // 3. run interaction-less rake deploy
  res.send(post);
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
