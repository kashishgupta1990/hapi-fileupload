'use strict';

const Hapi = require('hapi');
const Path = require('path');
const Inert = require('inert');
const fs = require('fs');

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});
server.connection({
    host: 'localhost',
    port: 8000
});
server.register(Inert, () => {
});

// Serve Static Files.
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});

// Add the route
server.route({
    method: 'POST',
    path: '/profile',
    config: {
        payload: {
            output: 'stream',
            allow: 'multipart/form-data' // important
        }
    },
    handler: function (request, reply) {
        const data = request.payload;
        const file = data['avatar'];
        const savePath = Path.join(__dirname, 'files', file.hapi.filename);
        const fileStream = fs.createWriteStream(savePath);
        file.pipe(fileStream);
        file.on('end', function (err) {
            if (err) {
                console.log('End', err);
            } else {
                reply({
                    message: 'Successfully Uploaded.'
                });
            }
        });
        file.on('error', function (err) {
            reply({
                message: 'Got some error.',
                error: err
            });
        });
    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
