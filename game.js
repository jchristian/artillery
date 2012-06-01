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
	function Tank(power, barrelRenderer, gunAngleController) {
		this.position = new Point(0, 0);
		this.power = power;
		this.barrelRenderer = barrelRenderer;
		this.gunAngleController = gunAngleController;

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

		this.barrelRenderer.draw(this, context);

		context.restore();

		context.restore();
	};
	Tank.prototype.angleGunUp = function() {
		this.gunAngleController.angleGunUp();
	};
	Tank.prototype.angleGunDown = function() {
		this.gunAngleController.angleGunDown();
	};
	Tank.prototype.pointOfLaunch = function() {
		var beginingOfBarrel = this.barrelRenderer.pointOfRotation;
		var endOfBarrel = beginingOfBarrel.translate(new Point(Math.cos(this.getGunAngle()) * this.barrelRenderer.barrelLength, Math.sin(this.getGunAngle()) * this.barrelRenderer.barrelLength));

		return endOfBarrel.translate(this.position);
	};
	Tank.prototype.fireBullet = function() {
		this.bulletFired(new Bullet(this.pointOfLaunch(), Vector.fromMagnitudeAnDirection(this.power.value, this.getGunAngle())));
	};
	Tank.prototype.getGunAngle = function() {
		return this.gunAngleController.gunAngle;
	};

	return Tank;
})();

RightBarrelRenderer = (function() {
	function RightBarrelRenderer() {
		this.pointOfRotation = new Point(26, 19);
		this.barrelLength = 25;
	}
	RightBarrelRenderer.prototype.draw = function(tank, context) {
		context.save();
		context.translate(this.pointOfRotation.x, this.pointOfRotation.y-2);
		context.rotate(tank.getGunAngle());
		context.strokeRect(0, 0, this.barrelLength, 2);
		context.restore();
	};

	return RightBarrelRenderer;
})();

LeftBarrelRenderer = (function() {
	function LeftBarrelRenderer() {
		this.pointOfRotation = new Point(14, 19);
		this.barrelLength = 25;
	}
	LeftBarrelRenderer.prototype.draw = function(tank, context) {
		context.save();
		context.translate(this.pointOfRotation.x, this.pointOfRotation.y-2);
		context.rotate(tank.getGunAngle());
		context.strokeRect(0, 0, this.barrelLength, 2);
		context.restore();
	};

	return LeftBarrelRenderer;
})();

RightGunAngleController = (function() {
	function RightGunAngleController() {
		this.gunAngle = 0.1 * Math.PI;
	}
	RightGunAngleController.prototype.angleGunUp = function() {
		if(this.gunAngle < Math.PI / 2)
			this.gunAngle += 0.005 * Math.PI;
	};
	RightGunAngleController.prototype.angleGunDown = function() {
		if(this.gunAngle >= 0)
			this.gunAngle -= 0.005 * Math.PI;
	};

	return RightGunAngleController;
})();

LeftGunAngleController = (function() {
	function LeftGunAngleController() {
		this.gunAngle = -0.1 * Math.PI + Math.PI;
	}
	LeftGunAngleController.prototype.angleGunUp = function() {
		if(this.gunAngle > Math.PI / 2)
			this.gunAngle -= 0.005 * Math.PI;
	};
	LeftGunAngleController.prototype.angleGunDown = function() {
		if(this.gunAngle < Math.PI)
			this.gunAngle += 0.005 * Math.PI;
	};

	return LeftGunAngleController;
})();

TankBuilder = (function() {
	function TankBuilder() { }
	TankBuilder.prototype.withRightBarrel = function() {
		this.barrelRenderer = new RightBarrelRenderer();
		return this;
	};
	TankBuilder.prototype.withLeftBarrel = function() {
		this.barrelRenderer = new LeftBarrelRenderer();
		return this;
	};
	TankBuilder.prototype.withRightGunAngleController = function() {
		this.gunAngleController = new RightGunAngleController();
		return this;
	};
	TankBuilder.prototype.withLeftGunAngleController = function() {
		this.gunAngleController = new LeftGunAngleController();
		return this;
	};
	TankBuilder.prototype.withPower = function(power) {
		this.power = power;
		return this;
	};
	TankBuilder.prototype.build = function() {
		return new Tank(this.power, this.barrelRenderer, this.gunAngleController);
	};

	return TankBuilder;
})();

Power = (function() {
	function Power(initialValue, minValue, maxValue, renderLocation) {
		this.value = initialValue;
		this.renderLocation = renderLocation;
		this.minValue = minValue;
		this.maxValue = maxValue;

		this.stepSize = (maxValue - minValue) / 50;
	}
	Power.prototype.draw = function(context) {
		context.save();
		context.strokeRect(this.renderLocation.x, this.renderLocation.y, 12, 52);

		context.fillStyle = "#751111";
		context.fillRect(this.renderLocation.x+1, this.renderLocation.y+1, 10, ((this.value-this.minValue)/(this.maxValue-this.minValue))*50);

		context.save();
		context.scale(1, -1);
		context.translate(0, -600);
		context.lineWidth = 1;
		context.strokeText("Power", this.renderLocation.x-9, this.renderLocation.y-600+133);
		context.restore();
		context.restore();
	};
	Power.prototype.increasePower = function() {
		if(this.value < this.maxValue)
			this.value += this.stepSize;
	};
	Power.prototype.decreasePower = function() {
		if(this.value > this.minValue)
			this.value -= this.stepSize;
	};

	return Power;
})();

InputController = (function() {
	function InputController(firstTank, firstPower, secondTank, secondPower) {
		this.functionMapping = {
			13:function() { firstTank.fireBullet(); }, //Enter
			37:function() { firstTank.angleGunUp(); }, //Left
			38:function() { firstPower.increasePower(); }, //Up
			39:function() { firstTank.angleGunDown(); }, //Right
			40:function() { firstPower.decreasePower(); }, //Down

			65:function() { secondTank.angleGunDown(); }, //A
			68:function() { secondTank.angleGunUp(); }, //D
			83:function() { secondPower.decreasePower(); }, //S
			87:function() { secondPower.increasePower(); }, //W
			32:function() { secondTank.fireBullet(); } //Space
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

	var firstTankPower = new Power(50, 20, 110, new Point(13, 540));
	var firstTank = new TankBuilder().withPower(firstTankPower).withRightBarrel().withRightGunAngleController().build();
	firstTank.position = new Point(50, 1);
	
	var secondTankPower = new Power(50, 20, 110, new Point(1175, 540));
	var secondTank = new TankBuilder().withPower(secondTankPower).withLeftBarrel().withLeftGunAngleController().build();
	secondTank.position = new Point(1120, 1);

	var physics = new Physics([]);
	var renderer = new Renderer(context, [firstTank, firstTankPower, secondTank, secondTankPower]);

	[firstTank, secondTank].forEach(function(tank) {
		tank.bulletFired = function(bullet) {
				physics.objects.push(bullet);
				renderer.itemsToDraw.push(bullet);
			};
	});

	renderer.render();

	document.addEventListener('keydown', function(e) { new InputController(firstTank, firstTankPower, secondTank, secondTankPower).handleKeyPress(e); });

	window.setInterval(function() {
		physics.update(refreshRate*5);
		renderer.render();
	}, refreshRate);
};
