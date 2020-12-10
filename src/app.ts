import express from 'express';
import bodyParser from 'body-parser';
import handlebars from 'handlebars';
import fs from 'fs';
import { exec } from 'child_process';

type BlogPostBody = {
  title: string;
  date: string;
  body: string;
  tags: [string];
  commitMessage: string;
}

// This is the path where posts exists. It's where new posts from the web service will be put.
const BLOG_PATH = '/Users/dylanhand/Projects/dylanhand.github.io/_posts';

// This is the path from which the site deployment script should be run
const DEPLOY_PATH = '/Users/dylanhand/Projects/dylanhand.github.io/';

const app = express();
app.use(bodyParser.json());
const port = 3000;

const renderMarkdown = (postBody: BlogPostBody): string => {
  const template = fs.readFileSync(`${__dirname}/post.hbs`, 'utf8');
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(postBody);
};

const filename = (title: string, date: string) => {
  const titleFormatted = title.toLowerCase().trim().replace(' ', '-');
  // TODO: validate dates. For now we assume the sender knows what they're doing
  // dates must be in format 1969-04-20
  return `${date}-${titleFormatted}.md`;
};

app.post('/publish', (req, res) => {
  const postBody: BlogPostBody = req.body;
  // TODO:
  // 1. create a markdown file with the post body and attributes
  // 2. move the file to blog path  (get path from env file)
  // 3. run interaction-less rake deploy
  const markdown = renderMarkdown(postBody);

  const filePath = `${BLOG_PATH}/${filename(postBody.title, postBody.date)}`;
  fs.writeFileSync(filePath, markdown);

  exec(`cd ${DEPLOY_PATH} ; rake 'deploy[${postBody.commitMessage}]'`, (err, stdout, stderr) => {
    console.log(err);
    console.log(stderr);
    console.log(stdout);
  });

  res.send(markdown);
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
