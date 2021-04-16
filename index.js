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
    setTimeout(()=>{
        res.json('This is a proxy service which proxies to Libris APIs.');
    }, 5000);
    
});

// Validate alma token
apiRoutes.use('', (req, res, next) => {
    if (req.headers.token) {
        try {
            //token = req.headers.authorization.slice(7, req.headers.authorization.length);
            token = req.headers.token;
            console.log(token)
            const verified = jwt.verify(token, publicKey, {algorithm: 'RS256'});
            console.log(verified)
            next();
        } catch (e) {
            return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + e.message });
        } 
    } else {
        res.sendStatus(403);
    }
});

apiRoutes.use('/libris', createProxyMiddleware({
    target: process.env.API_LIBRIS_URL,
    changeOrigin: true,
    pathRewrite: {
        [process.env.LIBRISREWRITE]: '',
    },
    logLevel: process.env.LOGLEVEL
}));

apiRoutes.use('/librisref', createProxyMiddleware({
    target: process.env.API_LIBRIS_REF_URL,
    changeOrigin: true,
    pathRewrite: {
        [process.env.LIBRISREWRITE]: '',
    },
    logLevel: process.env.LOGLEVEL
}));

apiRoutes.use('/librislogin', createProxyMiddleware({
    target: process.env.API_LIBRIS_LOGIN_URL,
    changeOrigin: true,
    pathRewrite: {
        [process.env.LIBRISLOGINREWRITE]: '',
    },
    logLevel: process.env.LOGLEVEL
}));

app.use('/librisproxy', apiRoutes);

var server = app.listen(process.env.PORT || 3002, function () {
    var port = server.address().port;
	console.log("App now running on port", port);
});