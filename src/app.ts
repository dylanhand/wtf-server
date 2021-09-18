import express from 'express';
import bodyParser from 'body-parser';
import handlebars from 'handlebars';
import fs from 'fs';
import { exec } from 'child_process';
import dotenv from 'dotenv';

type Image = {
  filename: string;
  base64: string;
}

type BlogPostBody = {
  title: string;
  date: string;
  body: string;
  tags: [string];
  image: Image;
  commitMessage: string;
}

dotenv.config();

// This is the path where blog posts live.
const { POSTS_PATH } = process.env;

// This is where images will be put.
const { IMAGES_PATH } = process.env;

// This is the path from which the site deployment script should be run.
const { DEPLOY_SCRIPT_PATH } = process.env;

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

const postFilename = (title: string, date: string) => {
  const titleFormatted = title.toLowerCase().trim().replace(' ', '-');
  // TODO: validate dates. For now we assume the sender knows what they're doing
  // dates must be in format: 1969-04-20
  return `${date}-${titleFormatted}.md`;
};

const savePost = (postBody: BlogPostBody) => {
  const markdown = renderMarkdown(postBody);
  const filePath = `${POSTS_PATH}/${postFilename(postBody.title, postBody.date)}`;
  fs.writeFileSync(filePath, markdown);
};

const saveImage = (image: Image) => {
  const imageBuffer = Buffer.from(image.base64, 'base64');
  const filePath = `${IMAGES_PATH}/${image.filename}`;
  fs.writeFileSync(filePath, imageBuffer);
};

const deploySite = (commitMessage: string) => {
  exec(`cd ${DEPLOY_SCRIPT_PATH} ; rake 'deploy[${commitMessage}]'`, (err, stdout, stderr) => {
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
  if (postBody.image) {
    saveImage(postBody.image);
  }
  deploySite(postBody.commitMessage);

  res.send('success, baby');
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
