const XState = require('xstate')
const Interpreter = require('xstate/lib/interpreter')
const Timers = require('timers')

const trafficLightMachine = XState.Machine({
  id: 'trafficLight',
  initial: 'Going',
  context: {
    blinkCount: 0
  },

  states: {
    Going: {
      id: 'Going',
      initial: 'GoWest',
      on: {
        WALK_BUTTON: '#trafficLight.SlowWalk'
      },
      states: {
        GoWest: {
          after: {
            6000: '#trafficLight.SlowWest'
          }
        },

        GoSouth: {
          after: {
            6000: '#trafficLight.SlowSouth'
          }
        }
      }
    },

    SlowWalk: {
      after: {
        500: 'Walk'
      }
    },

    SlowWest: {
      after: {
        500: 'Going.GoSouth'
      }
    },

    SlowSouth: {
      after: {
        500: 'Going.GoWest'
      }
    },

    Walk: {
      after: {
        3000: 'Blinking'
      },
      onEntry: (ctx, event) => {
        ctx.blinkCount = 0
      }
    },

    Blinking: {
      on: {
        '': {
          target: 'Going.GoSouth',
          cond: (ctx, event) => {
            return ctx.blinkCount > 5
          }
        }
      },
      after: {
        100: {
          target: 'Blinking',
          actions: (ctx, event) => {
            ctx.blinkCount = ctx.blinkCount + 1
          }
        }
      }
    }
  }
})

// const trafficLightMachine = Interpreter.interpret(
//   _trafficLightMachine
// ).onTransition(state => {
//   console.log(state.value)
// })

// console.log('Traffic light control: wal(k)\n')
// const readline = require('readline')
// readline.emitKeypressEvents(process.stdin)
// process.stdin.setRawMode(true)
// process.stdin.on('keypress', (str, key) => {
//   if (key.ctrl && key.name === 'c') {
//     process.exit()
//   } else {
//     if (key.name === 'k') trafficLight.send('WALK_BUTTON')
//   }
// })

export default trafficLightMachine
