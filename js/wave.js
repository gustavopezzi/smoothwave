$(document).ready(function() {
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    var DENSITY = 0.75;
    var FRICTION = 1.14;
    var MOUSE_PULL = 0.1;
    var AOE = 200;
    var DETAIL = Math.round(WIDTH / 36);
    var WATER_DENSITY = 1.07;
    var AIR_DENSITY = 1.14;

    var mouseIsDown = false;

    // mouse speed
    var ms = {
        x: 0,
        y: 0
    };

    // mouse position
    var mp = {
        x: 0,
        y: 0
    };

    var particles;
    
    var canvas = document.getElementById('wave');
    var context;

    if (canvas && canvas.getContext) {
        context = canvas.getContext('2d');

        particles = [];

        for (var i = 0; i < DETAIL + 1; i++) {
            particles.push({
                x: WIDTH / (DETAIL - 4) * (i - 2),
                y: HEIGHT * .5,
                original: {
                    x: 0,
                    y: HEIGHT * .5
                },
                velocity: {
                    x: 0,
                    y: Math.random() * 3
                },
                tension: {
                    x: 0,
                    y: 0
                },
                force: {
                    x: 0,
                    y: 0
                },
                mass: 10,
            });
        }

        init();
    }

    function init() {
        $(canvas).mousemove(mouseMove);
        $(canvas).mousedown(mouseDown);
        $(canvas).mouseup(mouseUp);
        $(window).resize(resizeCanvas);
        setInterval(timeUpdate, 40);
        resizeCanvas();
    }

    function timeUpdate(e) {
        var gradientFill = context.createLinearGradient(WIDTH * .5, HEIGHT * .2, WIDTH * .5, HEIGHT);
        gradientFill.addColorStop(0, '#ff59af');
        gradientFill.addColorStop(1, '#0cf');

        context.clearRect(0, 0, WIDTH, HEIGHT);
        context.fillStyle = gradientFill;
        context.beginPath();

        var len = particles.length;
        var i;

        var current, previous, next;

        for (i = 0; i < len; i++) {
            current = particles[i];
            previous = particles[i - 1];
            next = particles[i + 1];

            if (previous && next) {

                var forceY = 0;
                var extensionY = 0;

                if (i > 0) {
                    extensionY = previous.y - current.y - previous.tension.y;
                    forceY += -DENSITY * extensionY;
                }

                if (i < len - 1) {
                    extensionY = current.y - next.y - current.tension.y;
                    forceY += DENSITY * extensionY;
                }

                extensionY = current.y - current.original.y;
                forceY += DENSITY / 15 * extensionY;

                current.tension.y = next.y - current.y;
                current.velocity.y += -(forceY / current.mass) + current.force.y;
                current.velocity.y /= FRICTION;
                current.force.y /= FRICTION;
                current.y += current.velocity.y;

                var distance = distanceBetween(mp, current);

                if (distance < AOE) {
                    var distance = distanceBetween(mp, { 
                        x: current.original.x,
                        y: current.original.y
                    });

                    ms.x = ms.x * 0.98;
                    ms.y = ms.y * 0.98;

                    current.force.y += (MOUSE_PULL * (1 - (distance / AOE))) * ms.y;
                }

                var control = {
                    x: 0,
                    y: 0
                };

                control.x = previous.x;
                control.y = previous.y;

                var anchor = {
                    x: 0,
                    y: 0
                };

                anchor.x = previous.x + (current.x - previous.x) / 2;
                anchor.y = previous.y + (current.y - previous.y) / 2;

                context.quadraticCurveTo(control.x, control.y, anchor.x, anchor.y);
            }

        }

        context.lineTo(particles[particles.length - 1].x, particles[particles.length - 1].y);
        context.lineTo(WIDTH, HEIGHT);
        context.lineTo(0, HEIGHT);
        context.lineTo(particles[0].x, particles[0].y);

        context.fill();
    }

    function getClosestParticle(point) {
        var closestIndex = 0;
        var closestDistance = 1000;

        var len = particles.length;

        for (var i = 0; i < len; i++) {
            var thisDistance = distanceBetween(particles[i], point);

            if (thisDistance < closestDistance) {
                closestDistance = thisDistance;
                closestIndex = i;
            }
        }

        return particles[closestIndex];
    }

    function mouseMove(e) {
        ms.x = Math.max(Math.min(e.layerX - mp.x, 40), -40);
        ms.y = Math.max(Math.min(e.layerY - mp.y, 40), -40);

        mp.x = e.layerX;
        mp.y = e.layerY;
    }

    function mouseDown(e) {
        mouseIsDown = true;
    }

    function mouseUp(e) {
        mouseIsDown = false;
    }

    function resizeCanvas(e) {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;

        canvas.width = WIDTH;
        canvas.height = HEIGHT;

        for (var i = 0; i < DETAIL + 1; i++) {
            particles[i].x = WIDTH / (DETAIL - 4) * (i - 2);
            particles[i].y = HEIGHT * .5;

            particles[i].original.x = particles[i].x;
            particles[i].original.y = particles[i].y;
        }
    }

    function distanceBetween(p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
});