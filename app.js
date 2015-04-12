var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    glmtx = require('gl-matrix');

var ships = [];

server.listen(1337);

app.use('/public', express.static(__dirname + "/public"));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
    var ship = {};
    ship.id = socket.id;
    ship.lok = glmtx.vec2.fromValues(200, 200);
    ship.vel = glmtx.vec2.fromValues(0, 0);
    ship.accel = glmtx.vec2.fromValues(0, 0);
    ship.mass = 50;
    maxSpeed = 3.1,
    maxAccel = 1.0,
    acc = 0.1,
    grav = 0.02;
    var dir = 0; //cache direction
    console.log('New client connected! socket.id:' + socket.id+' from:'+socket.handshake.headers.host);
    socket.emit('initialize', ships);
    ships.push(ship);
    socket.broadcast.emit('new client', ship);
    socket.on('user input', function (data) {
        ship.lok = data.lok;
        ship.vel = data.vel;
        ship.accel = data.newAccel;
        dir = data.kp;
        console.log('User input: ' + data.kp);
        socket.broadcast.emit('process input', {id: socket.id, lok: ship.lok, vel: ship.vel, accel: ship.accel});
        console.log('New velocity vector: ' + 'x:' + ship.vel[0] + ' y:' + ship.vel[0]);
    });
	socket.on('stop input', function (data) {
		ship.x = data.x;
		ship.y = data.y;
		ship.v = data.v;
		dir = 0;
		socket.broadcast.emit('stop process', {id: socket.id, vector: ship.v, x: ship.x, y: ship.y});
	});
	socket.on('disconnect', function () {
		socket.broadcast.emit('disconnected', ship);
		for (var i=0; i<ships.length; i++) {
			if (ships[i].id == ship.id)
				ships.splice(i, 1);
		}
		console.log('Client' + socket.id + ' disconnected!');
	});
});
