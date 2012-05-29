Velocity = (function() {
	function Velocity(speed, direction) {
		this.speed = speed;
		this.direction = direction;
	}
	Velocity.prototype.displacement = function(time) {
		var distance = this.speed*time;
		return new Point(Math.cos(this.direction)*distance, Math.sin(this.direction)*distance);
	};

	return Velocity;
})();

Point = (function() {
	function Point(x, y) {
		this.x = x;
		this.y = y;
	}
	Point.prototype.translate = function(point) {
		return new Point(this.x + point.x, this.y + point.y);
	};
	Point.prototype.scale = function(scale) {
		return new Point(this.x * scale, this.y * scale);
	};

	return Point;
})();

Bullet = (function() {
	function Bullet(location, velocity) {
		this.location = location;
		this.velocity = velocity;
	}
	Bullet.prototype.draw = function(context) {
		context.beginPath();
		context.arc(this.location.x, this.location.y, 2, 0, Math.PI*2, false);
		context.fill();
	};
	Bullet.prototype.move = function(time) {
		this.location = this.location.translate(this.velocity.displacement(time));
	};

	return Bullet;
})();

Tank = (function() {
	function Tank() {
		this.position = new Point(0, 0);
		this.scale = .5;
		this.gunAngle = .1 * Math.PI;
		this.barrelPointOfRotation = new Point(62.5, 45);
		this.barrelLength = 75;

		this.bulletFired = function(bullet) { };
	}
	Tank.prototype.draw = function(context) {
		context.save();
		context.translate(this.position.x, this.position.y);

		context.save();
		context.scale(this.scale, this.scale);

		context.strokeStyle = "#888";
		context.lineWidth = 4;

		context.strokeRect(37.5, 37.5, 25, 12.5);
		context.strokeRect(12.5, 25, 75, 12.5);
		
		context.beginPath();
		context.lineTo(12.5, 0);
		context.lineTo(87.5, 0);
		context.stroke();
		context.beginPath();
		context.arc(12.5, 12.5, 12.5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(37.5, 12.5, 12.5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(62.5, 12.5, 12.5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(87.5, 12.5, 12.5, 0, Math.PI*2, false);
		context.stroke();

		context.save();
		context.translate(this.barrelPointOfRotation.x, this.barrelPointOfRotation.y-2);
		context.rotate(this.gunAngle);
		context.save();
		context.translate(0, 2);
		context.restore();
		context.strokeRect(0, 0, this.barrelLength, 5);
		context.restore();

		context.restore();

		context.restore();
	};
	Tank.prototype.angleGunUp = function() {
		if(this.gunAngle < Math.PI / 2)
			this.gunAngle += .005 * Math.PI;
	};
	Tank.prototype.angleGunDown = function() {
		if(this.gunAngle >= 0)
			this.gunAngle -= .005 * Math.PI;
	};
	Tank.prototype.pointOfLaunch = function() {
		var beginingOfBarrel = this.barrelPointOfRotation;
		var endOfBarrel = beginingOfBarrel.translate(new Point(Math.cos(this.gunAngle) * this.barrelLength, Math.sin(this.gunAngle) * this.barrelLength)).scale(this.scale);

		return endOfBarrel.translate(this.position);
	};
	Tank.prototype.fireBullet = function() {
		this.bulletFired(new Bullet(this.pointOfLaunch(), new Velocity(10, this.gunAngle)));
	}

	return Tank;
})();

InputController = (function() {
	function InputController(tank) {
		this.tank = tank;
		this.functionMapping = {
			13:function() { tank.fireBullet(); },
			38:function() { tank.angleGunUp(); },
			40:function() { tank.angleGunDown(); },
		};
	}
	InputController.prototype.handleKeyPress = function(e) {
		var e = window.event || e
		var key = e.charCode || e.keyCode

		if(this.functionMapping[key] !== undefined)
			this.functionMapping[key]();
		else
			console.log(key);
	};

	return InputController;
})();

Renderer = (function() {
	function Renderer(context, itemsToDraw) {
		this.context = context;
		this.itemsToDraw = itemsToDraw;
	}
	Renderer.prototype.render = function() {
		var context = this.context;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		this.itemsToDraw.forEach(function(itemToDraw) { itemToDraw.draw(context); });
	};

	return Renderer;
})();

Physics = (function() {
	function Physics(objects) {
		this.objects = objects;
		//this.gravity = new Acelleration(9.8, Math.PI*1.5);
	}
	Physics.prototype.update = function() {
		this.objects.forEach(function(object) {
			object.move(1);
		});
	};

	return Physics;
})();

var load = function(x, y) {
	var canvas = document.getElementById('mainCanvas');
	var context = canvas.getContext('2d');
	context.translate(0, 600);
	context.scale(1, -1);

	var tank = new Tank();
	tank.position = new Point(50, 1);

	var physics = new Physics([]);
	var renderer = new Renderer(context, [tank]);
	tank.bulletFired = function(bullet) {
		physics.objects.push(bullet);
		renderer.itemsToDraw.push(bullet);
	};

	renderer.render();

	document.addEventListener('keydown', function(e) { new InputController(tank).handleKeyPress(e); });
	//document.addEventListener('keydown', function(e) { renderer.render(); });

	window.setInterval(function() {
		physics.update();
		renderer.render();
	}, 30);
};
