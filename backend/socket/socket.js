const {Server} = require('socket.io');
const { responseBody } = require('../config/responseBody');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*'
        }
    });

    const videoNS = io.of('video');

    videoNS.on('connection', socket => {
        console.log(`{/video} socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`{/video} socket disconnected: ${socket.id}`)
        });
    });

}

const getVideoNamespace = () => {
    if(!io){
        return res.status(500).json(
            responseBody(500, 'Socket has not been initialized')
        )
    }
    return io.of('/video')
}

module.exports = {
    initSocket,
    getVideoNamespace
}

