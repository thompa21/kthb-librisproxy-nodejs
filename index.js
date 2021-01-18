const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const jwt = require("jsonwebtoken");

const app = express();

var apiRoutes = express.Router();

const PORT = 3010;
const HOST = "localhost";
const API_SERVICE_URL = "https://libris-qa.kb.se/"

apiRoutes.get('/info', (req, res, next) => {
    res.send('This is a proxy service which proxies to Billing and Account APIs.');
});

// Authorization
apiRoutes.use('', (req, res, next) => {
    if (req.headers.authorization) {
        //Alma Cloud App JWT
        const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo0h874QlymQoEhLZM5KS
gjnyzUJYASvpHgDDw7GB5XsX+xWJINDMjLetyMahb3b9df2TSqnVD3A+pAGu/Ubu
HeAXaKBMSTz+Z3okfzsHnPbV33fy5bHfEkDbn9IiuKiBUY9Y8kVy2mU8WNEq83ZB
7lb3vcIqtNJf9Xl/h5P6Vyr0817mVwr5dVJgihCmau86NrD+Q5ytC2EGHobiJE2r
mHH/ufR0ypZvRA3oXIMAZOjOyJnbbIr18Cazip+gda4LGXzGXQn89Ts3SxhGScHT
QMvPRMO6xf4W1+wn8kG/ejLif+acanJeRoDdYkNfw4p9AL1MB/9trvalg+KfX2Mp
1wIDAQAB
-----END PUBLIC KEY-----`

        try {
            token = req.headers.authorization.slice(7, req.headers.authorization.length);
            const verified = jwt.verify(token, publicKey, {algorithm: 'RS256'});
            next();
        } catch (e) {
            return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + e.message });
        } 
        //next();
    } else {
        res.sendStatus(403);
    }
});

apiRoutes.use('/', createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/`]: '',
    },
}));

app.use('/librisproxy', apiRoutes);

// Start the Proxy
app.listen(PORT, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});