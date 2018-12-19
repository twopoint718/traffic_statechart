const XState = require("xstate");
const Interpreter = require("xstate/lib/interpreter");
const Timers = require("timers");

const incrementBlinker = XState.actions.assign({
  blinkCount: (ctx, event) => ctx.blinkCount + 1
});

const blinkingIsDone = (ctx, event) => {
  return ctx.blinkCount > 5;
};

const trafficLightMachine = XState.Machine(
  {
    id: "trafficLight",
    initial: "GoWest",
    context: {
      walkButton: false,
      westSensor: false,
      southSensor: false,
      blinkCount: 0
    },

    states: {
      GoWest: {
        onEntry: "clearSensors",
        on: {
          WALK_BUTTON: { target: "SlowWest", actions: "setWalk" },
          SOUTH_SENSOR: { target: "SlowWest", actions: "setSouth" }
        },
        after: {
          60000: [
            {
              target: "SlowWest",
              cond: (ctx, _e) =>
                ctx.walkButton || ctx.southSensor || !ctx.westSensor
            }
          ]
        }
      },

      SlowWest: {
        after: {
          5000: [
            { target: "Walk", cond: (ctx, _e) => ctx.walkButton },
            { target: "GoSouth" }
          ]
        }
      },

      GoSouth: {
        onEntry: "clearSensors",
        on: {
          WALK_BUTTON: { target: "SlowSouth", actions: "setWalk" },
          WEST_SENSOR: { target: "SlowSouth", actions: "setWest" }
        },
        after: {
          60000: [
            {
              target: "SlowSouth",
              cond: (ctx, _e) =>
                ctx.walkButton || ctx.westSensor || !ctx.southSensor
            }
          ]
        }
      },

      SlowSouth: {
        after: {
          5000: [
            { target: "Walk", cond: (ctx, _e) => ctx.walkButton },
            { target: "GoWest" }
          ]
        },
        onExit: "clearSensors"
      },

      Walk: {
        onEntry: "clearSensors",
        on: {
          WEST_SENSOR: { target: "Blinking", actions: "setWest" },
          SOUTH_SENSOR: { target: "Blinking", actions: "setSouth" }
        },
        after: {
          60000: {
            target: "Blinking",
            cond: (ctx, _e) => ctx.southSensor || ctx.westSensor
          }
        }
      },

      Blinking: {
        on: {
          "": { target: "GoWest", cond: "blinkingIsDone" },
          BLINK: { target: "Blinking", actions: "incrementBlinker" }
        }
      }
    }
  },

  // Action callbacks
  {
    actions: {
      clearSensors: (ctx, _event) => {
        console.log("\tClearing sensors");
        ctx.walkButton = false;
        ctx.westSensor = false;
        ctx.southSensor = false;
      },
      setWalk: (ctx, _event) => {
        ctx.walkButton = true;
      },
      setWest: (ctx, _event) => {
        ctx.southSensor = true;
      },
      setSouth: (ctx, _event) => {
        ctx.southSensor = true;
      },
      incrementBlinker
    },
    guards: { blinkingIsDone }
  }
);

const trafficLight = Interpreter.interpret(trafficLightMachine).onTransition(
  state => {
    console.log(state.value);
  }
);

console.log("Traffic light control: wal(k), (w)est, (s)outh\n");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit();
  } else {
    if (key.name === "k") trafficLight.send("WALK_BUTTON");
    if (key.name === "w") trafficLight.send("WEST_SENSOR");
    if (key.name === "s") trafficLight.send("SOUTH_SENSOR");
  }
});

// Start the state interpreter
trafficLight.start();
