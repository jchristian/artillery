Vector = (function() {
	function Vector(x, y) {
		this.x = x;
		this.y = y;
		this.magnitude = this.getMagnitude();
		this.direction = this.getDirection();
	}
	Vector.prototype.add = function(vector) {
		return new Vector(this.x+vector.x, this.y+vector.y);
	};
	Vector.prototype.scale = function(scale) {
		var distance = this.magnitude*scale;
		return new Vector(this.x*scale, this.y*scale);
	};
	Vector.fromMagnitudeAnDirection = function(magnitude, direction) {
		return new Vector(Math.cos(direction)*magnitude, Math.sin(direction)*magnitude);
	};
	Vector.prototype.scaleByConstant = function(scale) {
		return new Vector(this.x*scale, this.y*scale);
	};
	Vector.prototype.scaleByVector = function(scale) {
		return new Vector(this.x*scale.x, this.y*scale.y);
	};
	Vector.prototype.getMagnitude = function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};
	Vector.prototype.getDirection = function() {
		return Math.atan2(this.x, this.y);
	};

	return Vector;
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
		this.location = this.location.translate(this.velocity.scale(time));
	};

	return Bullet;
})();

Tank = (function() {
	function Tank() {
		this.position = new Point(0, 0);
		this.gunAngle = 0.1 * Math.PI;
		this.barrelPointOfRotation = new Point(26, 19);
		this.barrelLength = 25;

		this.bulletFired = function(bullet) { };
	}
	Tank.prototype.draw = function(context) {
		context.save();
		context.translate(this.position.x, this.position.y);

		context.strokeStyle = "#888";
		context.lineWidth = 2;

		context.strokeRect(15, 15, 10, 5);
		context.strokeRect(5, 10, 30, 5);
		
		context.beginPath();
		context.lineTo(5, 0);
		context.lineTo(35, 0);
		context.stroke();
		context.beginPath();
		context.arc(5, 5, 5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(15, 5, 5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(25, 5, 5, 0, Math.PI*2, false);
		context.stroke();
		context.beginPath();
		context.arc(35, 5, 5, 0, Math.PI*2, false);
		context.stroke();

		context.save();
		context.translate(this.barrelPointOfRotation.x, this.barrelPointOfRotation.y-2);
		context.rotate(this.gunAngle);
		context.save();
		context.translate(0, 1);
		context.restore();
		context.strokeRect(0, 0, this.barrelLength, 2);
		context.restore();

		context.restore();

		context.restore();
	};
	Tank.prototype.angleGunUp = function() {
		if(this.gunAngle < Math.PI / 2)
			this.gunAngle += 0.005 * Math.PI;
	};
	Tank.prototype.angleGunDown = function() {
		if(this.gunAngle >= 0)
			this.gunAngle -= 0.005 * Math.PI;
	};
	Tank.prototype.pointOfLaunch = function() {
		var beginingOfBarrel = this.barrelPointOfRotation;
		var endOfBarrel = beginingOfBarrel.translate(new Point(Math.cos(this.gunAngle) * this.barrelLength, Math.sin(this.gunAngle) * this.barrelLength));

		return endOfBarrel.translate(this.position);
	};
	Tank.prototype.fireBullet = function() {
		this.bulletFired(new Bullet(this.pointOfLaunch(), Vector.fromMagnitudeAnDirection(100, this.gunAngle)));
	};

	return Tank;
})();

InputController = (function() {
	function InputController(tank) {
		this.tank = tank;
		this.functionMapping = {
			13:function() { tank.fireBullet(); },
			38:function() { tank.angleGunUp(); },
			40:function() { tank.angleGunDown(); }
		};
	}
	InputController.prototype.handleKeyPress = function(e) {
		var args = window.event || e;
		var key = args.charCode || args.keyCode;

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
		this.gravity = new Vector(0, -9.8);
	}
	Physics.prototype.update = function(timeElapsed) {
		var physics = this;
		this.objects.forEach(function(object) {
			object.velocity = object.velocity.add(physics.gravity.scaleByConstant(timeElapsed/1000));
			object.move(timeElapsed/1000);
		});
	};

	return Physics;
})();

var load = function(x, y) {
	var refreshRate = 30;
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

	window.setInterval(function() {
		physics.update(refreshRate*5);
		renderer.render();
	}, refreshRate);
};
