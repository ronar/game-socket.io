var canv = document.getElementById('canv'),
    angle = document.getElementById('angle'),
    ctx = canv.getContext('2d'),
    socket = io.connect(),
    cliShips = [],
    maxSpeed = 3.1,
    maxAccel = 1.0,
    acc = 0.1,
    grav = 0.020,
    img,
    t = 0.0,
    dt = 16.7,
    intId,
    sendInterval = 50,
    maxDesync = 10;

vec2.limit = function (out, v, high) {
    'use strict';

    var x = v[0],
        y = v[1];

    var len = x*x + y*y;

    if (len > high*high && len > 0) {
        out[0] = x;
        out[1] = y;
        vec2.normalize(out, out);
        vec2.scale(out, out, high);
    }
    
    return out;
}

vec2.lowLimit = function (out, v, low) {
    'use strict';

    var x = v[0],
        y = v[1];

    var len = x*x + y*y;

    if (len < low*low && len > 0) {
        out[0] = x;
        out[1] = y;
        vec2.normalize(out, out);
        vec2.scale(out, out, low);
    }
    
    return out;
}

vec2.rotate2d = function (out, v, rads) {
    'use strict';

    var x = v[0],
        y = v[1];

    //var rads = degrees * Math.PI/180;

    var ca = Math.cos(rads),
        sa = Math.sin(rads);

    out[0] = ca * x - sa * y;
    out[1] = sa * x + ca * y;
    
    return out;
}

var ship = function (id, lok, mass) {
    this.id = id;
    this.coord = lok;
    this.servCoord = lok;
    this.vel0 = vec2.fromValues(0, 0);
    this.vel = vec2.fromValues(0, 0);
    this.accel = vec2.fromValues(acc, 0);
    this.gravity = vec2.fromValues(0, 0);
    this.newAccel = vec2.fromValues(acc, 0);
    this.ang = -1.57079632679489661;
    this.servVel = lok;
    this.oldV = vec2.fromValues(0, 0); // used for point of returning
    this.newV = vec2.create();
    this.oldSv = vec2.fromValues(0, 0); // used for smooth rotation, stores the vector before rotation
    
    this.mass = mass;
    img = new Image();
    img.src = "/public/ship.png";
    this.img = img;
    
    var a1 = 0;

    this.addForce = function (f) {
        vec2.add(this.accel, this.accel, f);
        console.log('this.accel[0]' + this.accel[0] + 'this.accel[1]' + this.accel[1]);
    }

    var t, td;
    t = (new Date()).getTime();

    dt = t;

    this.move = function () {
        var forces;
        
        vec2.negate(this.gravity, this.newAccel);
        vec2.scale(this.gravity, this.gravity, grav);
        //vec2.scale(this.gravity, this.gravity, 1 / this.mass);
        vec2.add(this.newAccel, this.newAccel, this.gravity);
        vec2.lowLimit(this.newAccel, this.newAccel, 0.0001);
        forces = vec2.add(vec2.create(), this.accel, grav);
        //this.addForce(this.accel);
        vec2.lerp(this.accel, this.accel, this.newAccel, a1);
        vec2.lerp(this.vel, this.vel0, vec2.scale(vec2.create(), this.accel, (dt - t) / 1000), a1 / 60);
        this.vel0 = this.vel;
        vec2.limit(this.vel, this.vel, maxSpeed);
        vec2.add(this.coord, this.coord, this.vel);
        
        dt = (new Date()).getTime();
           
        a1 += 0.0167;
        if (a1 > 0.9999) {
            a1 = 0.5;
            

        }
    }
}

var thetaAng = 0,
    alpha = 0,
    dTime = 0,
    tmpVec = vec2.create();
    
ctx.lineWidth = 5;
    
var renderingLoop = function () {
    computeFPS();

    if (keyPressed[37] == true) {
        cliShips[0].ang -= 0.1;
        //if (cliShips[0].ang < -(2 * Math.PI)) cliShips[0].ang += 2 * Math.PI;
        vec2.rotate2d(cliShips[0].newAccel, cliShips[0].newAccel, -Math.PI / 30);
    }
    
    if (keyPressed[38] == true) {
        vec2.scale(cliShips[0].newAccel, cliShips[0].newAccel, 1.12);
        vec2.limit(cliShips[0].newAccel, cliShips[0].newAccel, maxAccel);
    }
    
    if (keyPressed[39] == true) {
        cliShips[0].ang += 0.1;
        //if (cliShips[0].ang > 2 * Math.PI) cliShips[0].ang -= 2 * Math.PI;
        vec2.rotate2d(cliShips[0].newAccel, cliShips[0].newAccel, Math.PI / 30);
    }
    
    if (keyPressed[40] == true) {
        vec2.scale(cliShips[0].newAccel, cliShips[0].newAccel, 0.88);
        vec2.limit(cliShips[0].newAccel, cliShips[0].newAccel, acc);
    }
        
    // Clear the canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.restore();

    for(i=0; i < cliShips.length; i++) {
    //thetaAng = Math.atan2((cliShips[0].s.y - cliShips[0].y), (cliShips[0].s.x - cliShips[0].x)) - Math.atan2(cliShips[i].v.y, cliShips[i].v.x);
    //if (thetaAng < 0) thetaAng += 2 * Math.PI;			
    //thetaAng = Math.atan2(cliShips[i].y - cliShips[i].s.y, cliShips[i].x - cliShips[i].s.x);
            
    //ctx.beginPath();
    //ctx.arc(cliShips[i].servCoord[0] + 29, cliShips[i].servCoord[1] + 33, 5, 0, Math.PI * 2, false);
    //ctx.fillStyle = '#fff';
    //ctx.fill();
    ctx.fillStyle = '#fff';

    cliShips[i].move();
    if (i != 0)
        vec2.lerp(cliShips[i].coord, cliShips[i].coord, cliShips[i].servCoord, alpha / 60);

    ctx.fillText(cliShips[i].id, cliShips[i].coord[0], cliShips[i].coord[1]);
    //ctx.fillText('vel[0]: ' + cliShips[i].vel[0] + ' vel[1]: ' + cliShips[i].vel[1], cliShips[i].coord[0], cliShips[i].coord[1]-20);
    //ctx.fillText('coord[0]: ' + cliShips[i].coord[0] + ' coord[1]: ' + cliShips[i].coord[1], cliShips[i].coord[0], cliShips[i].coord[1]-40);
    //ctx.fillText('accel[0]: ' + cliShips[i].accel[0] + ' accel[1]: ' + cliShips[i].accel[1], cliShips[i].coord[0], cliShips[i].coord[1]-60);
    //ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(cliShips[i].coord[0] + 29, cliShips[i].coord[1] + 33);
    
    if (i != 0) {
        vec2.lerp(tmpVec, cliShips[i].oldV, vec2.lerp(vec2.create(), cliShips[i].accel, cliShips[i].newAccel, 0.5), alpha);
    }
    else
        vec2.lerp(tmpVec, cliShips[i].accel, cliShips[i].newAccel, alpha);
    ctx.rotate(Math.atan2(tmpVec[1], tmpVec[0]) - 1.57079632679489661);

    ctx.drawImage(cliShips[i].img, -29, -33);
					
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // velocity vector
    ///ctx.beginPath();
    //ctx.strokeStyle = '#ffffff';
    //ctx.lineWidth = 1;
    //ctx.moveTo(cliShips[i].coord[0] + 29, cliShips[i].coord[1] + 33);
    //ctx.lineTo(cliShips[i].coord[0] + 29 + cliShips[i].vel[0] * 15, cliShips[i].coord[1] + 33 + cliShips[i].vel[1] * 15);
    //ctx.stroke();

    // newAccel vector
    //ctx.beginPath();
    //ctx.strokeStyle = '#ff0000';
    //ctx.lineWidth = 1;
    //ctx.moveTo(cliShips[i].coord[0] + 29, cliShips[i].coord[1] + 33);
    //ctx.lineTo(cliShips[i].coord[0] + 29 + cliShips[i].newAccel[0] * 150, cliShips[i].coord[1] + 33 + cliShips[i].newAccel[1] * 150);
    //ctx.stroke();

    if (((new Date()).getTime() - dTime) > sendInterval) {
        dTime = (new Date()).getTime();
        socket.emit('user input', {vel: cliShips[0].vel, newAccel: cliShips[0].newAccel, lok: cliShips[0].coord, kp: keyPressed});
        console.log('Sended! now = ' + dTime);
    }

    alpha += 0.0167;
    if (alpha > 0.9999) {
       alpha = 0.0167;
       cliShips[i].oldV = cliShips[i].accel;
    }
}
    angle.innerHTML = keyPressed[37] + ' ' + keyPressed[38] + ' ' + keyPressed[39] + ' ' + keyPressed[40];
      
    queueNewFrame(renderingLoop);	
}
		
// FPS
var previous = [],
    di = document.getElementById('debug-info');

function computeFPS () {
    if (previous.length > 60)
        previous.splice(0, 1);

    var t = (new Date()).getTime();
    previous.push(t);
    var sum = 0;

    for (var i=0; i<previous.length-1; i++) {
        sum += previous[i+1] - previous[i];
    }

    var fps = 1000.0 / (sum / previous.length);
    di.innerHTML = 'FPS:' + fps.toFixed();
}

function queueNewFrame () {		
    if (window.requestAnimationFrame)
        window.requestAnimationFrame(renderingLoop);
    else if (window.msRequestAnimationFrame)
        window.msRequestAnimationFrame;
    else if (window.webkitRequestAnimationFrame)
        window.webkitRequestAnimationFrame;		
}
		
ctx.font = '16px arial';
ctx.textAlign = 'center';

var newShip = new ship(0, vec2.fromValues(200, 200), 50);
cliShips.push(newShip);

var prevKey = 0,
    keyPr,
    keyPressed = {};

document.onkeydown = function (e) {
    e.preventDefault();
    keyPr = e.keyCode;

    keyPressed[keyPr] = true;
			
    if (prevKey != e.keyCode) {
        prevKey = e.keyCode;				
        //socket.emit('user input', {v: cliShips[0].v, x: cliShips[0].x, y: cliShips[0].y, kc: e.keyCode});
        //console.log('Ship changed direction: ' + e.keyCode);
    }

    console.log(((new Date()).getTime() - dTime));
}

document.onkeyup = function (e) {
    keyPr = 0;
    
    keyPressed[e.keyCode] = false;
    
    if (prevKey != 0) {
        prevKey = 0;
        clearInterval(intId);
        //socket.emit('stop input', {v: cliShips[0].vel, x: cliShips[0].coord[0], y: cliShips[0].coord[1]});
    }
}

// To get aware of another ships
socket.on('initialize', function (ships) {
    ships.forEach(function (iship) {
        newShip = new ship(iship.id, iship.lok, 50);

        //newShip.oldSv.vec2.set(cliShips[i].newSv.x, cliShips[i].newSv.y);

        cliShips.push(newShip);
        console.log('Ship: ' + iship.id + ' appeared!');
    });
});

socket.on('new client', function (data) {
    newShip = new ship(data.id, data.lok, 50);
    cliShips.push(newShip);
    console.log('New client: ' + ship.id + ' connected!');
});


socket.on('disconnected', function (ship) {
    for(var i=0; i<cliShips.length; i++) {
        if (cliShips[i].id == ship.id)
            cliShips.splice(i, 1);
    }
    console.log('Client: ' + ship.id + ' disconnected!');
});

socket.on('process input', function (data) {
    console.log('Ship ' + data.id  + ' flew in ' + data.vector + ' direction.');

    for(var i=0; i<cliShips.length; i++) {
        if (cliShips[i].id == data.id) {
            cliShips[i].newAccel = data.accel;
            cliShips[i].servCoord = data.lok;
            cliShips[i].vel = data.vel;
            //cliShips[i].oldV = cliShips[i].accel;
        }
    }
});

socket.on('stop process', function (data) {
    console.log('Ship ' + data.id + ' stops flying.');

    for(var i=0; i<cliShips.length; i++) {
        if (cliShips[i].id == data.id) {
            cliShips[i].newSv = data.vector;
            vec2.set([i].servCoord, data.x, data.y);
            cev2.set(cliShips[i].vel, cliShips[i].newSv.x, cliShips[i].newSv.y);
        }
    }
});

renderingLoop();