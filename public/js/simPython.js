/* global Sk, sim */
/* exported $builtinmodule */

var $builtinmodule = function(name) {
  var mod = {};

  mod.Motor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      if (address.v == 'outA') {
        self.motor = robot.leftWheel;
      } else if (address.v == 'outB') {
        self.motor = robot.rightWheel;
      } else {
        self.motor = robot.getComponentByPort(address.v);
        if (!self.motor) {
          throw new Sk.builtin.TypeError('No motor connected to ' + String(address.v));
        }
      }
    });

    $loc.command = new Sk.builtin.func(function(self, command) {
      if (command.v == 'run-timed') {
        self.motor.time_target = Date.now() + self.motor.time_sp * 1000;
        self.motor.runTimed();

      } else if (command.v == 'run-to-rel-pos') {
        self.motor.position_target = self.motor.position + self.motor.position_sp;
        self.motor.runToPosition();

      } else if (command.v == 'run-to-abs-pos') {
        self.motor.position_target = self.motor.position_sp;
        self.motor.runToPosition();

      } else if (command.v == 'run-forever') {
        self.motor.runForever();

      } else if (command.v == '') {
        self.motor.stop();
      }

      self.motor.command = command.v;
    });

    $loc.stop_action = new Sk.builtin.func(function(self, stop_action) {
      if (typeof stop_action != 'undefined') {
        self.motor.stop_action = stop_action.v;
      } else {
        return self.motor.stop_action;
      }
    });


    $loc.state = new Sk.builtin.func(function(self) {
      return self.motor.state;
    });

    $loc.speed_sp = new Sk.builtin.func(function(self, speed_sp) {
      if (typeof speed_sp != 'undefined') {
        self.motor.speed_sp = speed_sp.v;
      } else {
        return self.motor.speed_sp;
      }
    });

    $loc.time_sp = new Sk.builtin.func(function(self, time_sp) {
      if (typeof time_sp != 'undefined') {
        self.motor.time_sp = time_sp.v;
      } else {
        return self.motor.time_sp;
      }
    });

    $loc.position = new Sk.builtin.func(function(self, pos) {
      if (typeof pos != 'undefined') {
        self.motor.positionAdjustment += self.motor.position - pos.v;
        self.motor.position = pos.v;
        self.motor.prevPosition = pos.v % 360;
      } else {
        return self.motor.position;
      }
    });

    $loc.polarity = new Sk.builtin.func(function(self, polarity) {
      if (typeof polarity != 'undefined') {
        self.motor.polarity = polarity.v;
      } else {
        return self.motor.polarity;
      }
    });

    $loc.position_sp = new Sk.builtin.func(function(self, position_sp) {
      if (typeof position_sp != 'undefined') {
        self.motor.position_sp = position_sp.v;
      } else {
        return self.motor.position_sp;
      }
    });

    $loc.speed = new Sk.builtin.func(function(self) {
      return self.motor.speed;
    });

  }, 'Motor', []);

  mod.ColorSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor) {
        throw new Sk.builtin.TypeError('No color sensor connected to ' + String(address.v));
      }
    });

    $loc.value = new Sk.builtin.func(function(self) {
      return self.sensor.getRGB();
    });

    $loc.valueLAB = new Sk.builtin.func(function(self) {
      var rgb;
      var xyz = [0, 0, 0];
      var lab = [0, 0, 0];

      rgb = self.sensor.getRGB();

      for (let i=0; i<3; i++) {
        let c = rgb[i] / 255;
        if (c > 0.04045) {
          rgb[i] = Math.pow((c + 0.055) / 1.055, 2.4);
        } else {
          rgb[i] = c / 12.92;
        }
      }

      xyz[0] = (rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805) / 0.95047;
      xyz[1] = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 1.00000;
      xyz[2] = (rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505) / 1.08883;

      for (let i=0; i<3; i++) {
        if (xyz[i] > 0.008856) {
          xyz[i] = Math.pow(xyz[i], 1/3);
        } else {
          xyz[i] = (7.787 * xyz[i]) + 16/116;
        }
      }

      lab[0] = (116 * xyz[1]) - 16;
      lab[1] = 500 * (xyz[0] - xyz[1]);
      lab[2] = 200 * (xyz[1] - xyz[2]);

      return lab;
    });

    $loc.valueHSV = new Sk.builtin.func(function(self) {
      var rgb;
      var hsv = [0, 0, 0];

      rgb = self.sensor.getRGB();
      for (let i=0; i<3; i++) {
        rgb[i] = rgb[i] / 255;
      }

      var cMax = Math.max(...rgb);
      var cMin = Math.min(...rgb);
      var diff = cMax - cMin;

      if (cMax == cMin) {
        hsv[0] = 0;
      } else if (cMax == rgb[0]) {
        hsv[0] = 60 * (rgb[1] - rgb[2]) / diff;
      } else if (cMax == rgb[1]) {
        hsv[0] = 60 * (2 + (rgb[2] - rgb[0]) / diff);
      } else {
        hsv[0] = 60 * (4 + (rgb[0] - rgb[1]) / diff);
      }
      if (hsv[0] < 0) {
        hsv[0] += 360;
      }

      if (cMax == 0) {
        hsv[1] = 0;
      } else {
        hsv[1] = diff / cMax * 100;
      }

      hsv[2] = cMax * 100;

      return hsv;
    });

    $loc.valueHLS = new Sk.builtin.func(function(self) {
      var rgb = [0, 0, 0];
      var hls = [0, 0, 0];

      if (self.side == 'left') {
        rgb = sim.robotStates.sensor1;
      } else if (self.side == 'right') {
        rgb = sim.robotStates.sensor2;
      }
      for (let i=0; i<3; i++) {
        rgb[i] = rgb[i] / 255;
      }

      var cMax = Math.max(...rgb);
      var cMin = Math.min(...rgb);
      var diff = cMax - cMin;

      if (cMax == cMin) {
        hls[0] = 0;
      } else if (cMax == rgb[0]) {
        hls[0] = 60 * (rgb[1] - rgb[2]) / diff;
      } else if (cMax == rgb[1]) {
        hls[0] = 60 * (2 + (rgb[2] - rgb[0]) / diff);
      } else {
        hls[0] = 60 * (4 + (rgb[0] - rgb[1]) / diff);
      }
      if (hls[0] < 0) {
        hls[0] += 360;
      }

      if (cMax == 0 || cMin == 255) {
        hls[2] = 0;
      } else {
        hls[2] = diff / (1 - Math.abs(cMax + cMin - 1)) * 100;
      }

      hls[1] = (cMax + cMin) / 2 * 100;

      return hls;
    });

  }, 'ColorSensor', []);

  mod.GyroSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor) {
        throw new Sk.builtin.TypeError('No gyro sensor connected to ' + String(address.v));
      }
    });

    $loc.angleAndRate = new Sk.builtin.func(function(self) {
      var gyro = [];

      gyro[0] = Math.round(self.sensor.getAngle());
      gyro[1] = Math.round(self.sensor.getRate());

      return gyro;
    });

  }, 'GyroSensor', []);

  mod.UltrasonicSensor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    var self = this;

    $loc.__init__ = new Sk.builtin.func(function(self, address) {
      self.sensor = robot.getComponentByPort(address.v);
      if (!self.sensor) {
        throw new Sk.builtin.TypeError('No ultrasonic sensor connected to ' + String(address.v));
      }
    });

    $loc.dist = new Sk.builtin.func(function(self) {
      return self.sensor.getDistance();
    });

  }, 'UltrasonicSensor', []);


  return mod;
};