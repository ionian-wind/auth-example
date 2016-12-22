const auth = require('basic-auth');
const express = require('express');
const app = express();

app.use((req, res, next) => {
    const credentials = auth(req);
    if (!credentials) {
        res.setHeader('WWW-Authenticate', 'Basic realm="test"');
        res.status(401).end('=(');
    } else {
        console.log(req.headers['x-original-uri']);
        next();
    }
});

app.get('/', (req, res, next) => {
    res.end(`<!-- nginx auth and x-accel-redirect example -->
<html>
    <body>
    <ul>
        <li>
            <a href='/path/allowed'>allowed url</a>
        </li>
        <li>
            <a href='/path/forbidden'>forbidden url</a>
        </li>
        <li>
            <a href='/file/allowed'>allowed file</a>
        </li>
        <li>
            <a href='/file/forbidden'>forbidden file</a>
        </li>
    </ul>
    </body>
</html>`);
});

app.get('/path/:anystring', (req, res, next) => {
    if (req.headers['x-auth-header'] === 'allowed') {
        res.end('permitted');
    } else {
        res.end('show me never');
    }
});

app.use('/auth/file/:file_type', (req, res, next) => {
    if (req.params.file_type === 'allowed') {
        res.setHeader('X-Accel-Redirect', '/secured/test.txt');
        res.status(200).end();
    } else {
        res.status(403).end('forbidden');
    }
});

app.use('/auth/path', (req, res, next) => {
    const [,,path_type] = req.headers['x-original-uri'].split('/');
    if (path_type === 'allowed') {
        res.setHeader('X-Auth-Header', path_type);
        res.status(200).end();
    } else {
        res.status(403).end('forbidden');
    }
});

app.listen(8080, () => console.log('server is online'));
