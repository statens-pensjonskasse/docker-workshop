//const config = require('../config.json')[process.env.NODE_ENV];

const backend = require('./server/core');
backend.set('port', 4000);

const backendServer = backend.listen(backend.get('port'), function () {
    console.log(`Server listening on http://localhost:${backend.get('port')} in ${backend.get('env')} mode`);
});

const frontend = require('./client/client');
frontend.set('port', 3000);

const frontendServer = frontend.listen(frontend.get('port'), function () {
    console.log(`Client listening on http://localhost:${frontend.get('port')} in ${frontend.get('env')} mode`);
});