require('dotenv').config()

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require("jsonwebtoken");
const app = express();
var cors = require('cors')

const publicKey = require('fs').readFileSync(__dirname + '/public-key.pem', { encoding: "utf8" });

app.use(cors())

var apiRoutes = express.Router();

apiRoutes.get('/info', (req, res, next) => {
    res.send('This is a proxy service which proxies to Libris APIs.');
});

// Validate alma token
apiRoutes.use('', (req, res, next) => {
    if (req.headers.authorization) {
        try {
            token = req.headers.authorization.slice(7, req.headers.authorization.length);
            const verified = jwt.verify(token, publicKey, {algorithm: 'RS256'});
            next();
        } catch (e) {
            return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + e.message });
        } 
    } else {
        res.sendStatus(403);
    }
});

apiRoutes.use('/libris', createProxyMiddleware({
    target: process.env.API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/librisproxy/libris`]: '',
    },
    logLevel: 'debug'
}));

app.use('/librisproxy', apiRoutes);

var server = app.listen(process.env.PORT || 3002, function () {
    var port = server.address().port;
	console.log("App now running on port", port);
});