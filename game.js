Tank = (function() {
	function Tank() {
		this.position = { x:0, y:0 };
		this.scale = .5;
		this.gunAngle = -.1 * Math.PI;
	}
	Tank.prototype.draw = function(context) {
		context.save();
		context.translate(this.position.x, this.position.y);

		context.save();
		context.scale(this.scale, this.scale);

		context.strokeStyle = "#888";
		context.lineWidth = 4;

		context.strokeRect(37.5, -50, 25, 12.5);
		context.strokeRect(12.5, -37.5, 75, 12.5);
		
		context.beginPath();
		context.lineTo(12.5, 0);
		context.lineTo(87.5, 0);
		context.stroke();
		context.beginPath();
		context.arc(12.5, -12.5, 12.5, 0, Math.PI*2, true);
		context.stroke();
		context.beginPath();
		context.arc(37.5, -12.5, 12.5, 0, Math.PI*2, true);
		context.stroke();
		context.beginPath();
		context.arc(62.5, -12.5, 12.5, 0, Math.PI*2, true);
		context.stroke();
		context.beginPath();
		context.arc(87.5, -12.5, 12.5, 0, Math.PI*2, true);
		context.stroke();

		context.save();
		context.translate(62.5, -47);
		context.rotate(this.gunAngle);
		context.strokeRect(0, 0, 75, 5);
		context.restore();

		context.restore();

		context.restore();
	};
	Tank.prototype.angleGunUp = function() {
		if(this.gunAngle > -Math.PI / 2)
			this.gunAngle -= .005 * Math.PI;
	};
	Tank.prototype.angleGunDown = function() {
		if(this.gunAngle <= 0)
			this.gunAngle += .005 * Math.PI;
	};

	return Tank;
})();

InputController = (function() {
	function InputController(tank) {
		this.tank = tank;
		this.functionMapping = {
			38:function() { tank.angleGunUp() },
			40:function() { tank.angleGunDown() },
		};
	}
	InputController.prototype.handleKeyPress = function(e) {
		var e = window.event || e
		var key = e.charCode || e.keyCode

		if(this.functionMapping[key] !== undefined)
			this.functionMapping[key]();
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

var load = function(x, y) {
	var canvas = document.getElementById('mainCanvas');
	var context = canvas.getContext('2d');

	var tank = new Tank();
	tank.position = { x:50, y:398 };

	var renderer = new Renderer(context, [tank]);
	document.addEventListener('keydown', function(e) { new InputController(tank).handleKeyPress(e); });
	document.addEventListener('keydown', function(e) { renderer.render(); });
};
