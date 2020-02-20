// Lab configuration
module.exports = {
  GUI: 'motor_practice.ejs',
  GUI_JS: 'real.js',
  parameters: {
    simulation: {
      parameter_names: ['Vup1', 'Vdown', 'Delay'],
      options: [{
        name: 'Config',
        parameter_indexes: [0, 1, 2]
      }],
    },
    controller: {
      parameter_names: ['Threshold', 'Min', 'Max'],
      options: [{
        name: 'Single',
        parameter_indexes: [0]
      }, {
        name: 'Double',
        parameter_indexes: [1, 2]
      }]
    },
  },
  signals: {
    i: [{
      name: "SetPoint",
      type: "double",
      value: 0.0,
    }],
    o: [{
      name: "Time",
      type: "double",
      value: 0.0
    }, {
      name: "Output",
      type: "double",
      value: 0.0
    }]
  }
}