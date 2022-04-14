import express from 'express';
import bodyParser from 'body-parser';
import handlebars from 'handlebars';
import fs from 'fs';
import { exec } from 'child_process';
import dotenv from 'dotenv';

type BlogPostBody = {
  title: string;
  body: string;
}

dotenv.config();

// This is the path where blog posts live.
const { POSTS_PATH } = process.env;

// This is the path from which git commands should be run (for deployment)
const { REPO_PATH } = process.env;

const app = express();
app.use(bodyParser.json({ limit: '8mb' }));
const port = 3000;

const isAuthorized = (req: express.Request): boolean => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    if (token === process.env.AUTH_TOKEN) {
      return true;
    }
  }
  return false;
};

app.use((req, res, next) => {
  if (isAuthorized(req)) {
    next();
  } else {
    res.status(401).send({ error: 'Unauthorized' });
  }
});

const renderMarkdown = (postBody: BlogPostBody): string => {
  const template = fs.readFileSync(`${__dirname}/post.hbs`, 'utf8');
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(postBody);
};

const dateString = () => {
  let yourDate = new Date();
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split('T')[0];
};

const postFilename = (title: string) => {
  const titleFormatted = title.toLowerCase().trim().replace(' ', '-');
  return `${dateString()}-${titleFormatted}.md`;
};

const savePost = (postBody: BlogPostBody) => {
  const markdown = renderMarkdown(postBody);
  const filePath = `${POSTS_PATH}/${postFilename(postBody.title)}`;
  fs.writeFileSync(filePath, markdown);
};

const deploySite = (postTitle: String) => {
  exec(`cd ${REPO_PATH} ; git pull ; git add . ; git commit -m "New Post: ${postTitle}" ; git push`, (err, stdout, stderr) => {
    console.log(err);
    console.log(stderr);
    console.log(stdout);
  });
};

app.get('/', (req, res) => {
  res.send('you\'re doing great');
});

app.post('/publish', (req, res) => {
  const postBody: BlogPostBody = req.body;

  savePost(postBody);
  deploySite(postBody.title);

  res.send('you did great');
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
