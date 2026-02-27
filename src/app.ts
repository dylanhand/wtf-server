import express from 'express';
import handlebars from 'handlebars';
import fs from 'fs';
import { execFile as execFileCallback } from 'child_process';
import { promisify } from 'util';
const execFile = promisify(execFileCallback);
import dotenv from 'dotenv';

type BlogPostBody = {
  title: string;
  body: string;
}

dotenv.config();

// This is the path from which git commands should be run (for deployment)
const { REPO_PATH } = process.env;
const { AUTH_TOKEN } = process.env;
if (!REPO_PATH) throw new Error('REPO_PATH is not set');
if (!AUTH_TOKEN) throw new Error('AUTH_TOKEN is not set');

const app = express();
app.use(express.json({ limit: '8mb' }));
const port = 8000;

const isAuthorized = (req: express.Request): boolean => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    if (token === AUTH_TOKEN) {
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
  const filePath = `${REPO_PATH}/_posts/${postFilename(postBody.title)}`;
  fs.writeFileSync(filePath, markdown);
};

const deploySite = async (postTitle: string) => {
  const git = (...args: string[]) => execFile('git', ['-C', REPO_PATH, ...args]);
  await git('pull');
  await git('add', '.');
  await git('commit', '-m', `New Post: ${postTitle}`);
  await git('push');
};

app.get('/', (req, res) => {
  res.send('you\'re doing great');
});

app.post('/publish', async (req, res) => {
  const { title, body } = req.body;
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).send({ error: 'title is required' });
    return;
  }
  if (typeof body !== 'string' || !body.trim()) {
    res.status(400).send({ error: 'body is required' });
    return;
  }
  try {
    savePost({ title, body });
    await deploySite(title);
    res.send('you did great');
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Deploy failed' });
  }
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
