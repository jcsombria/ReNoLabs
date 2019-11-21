// Lab configuration
module.exports = {
  GUI: 'motor_practice.ejs',
  GUI_JS: 'real.js',
  simulation: {
    parameter_names: ['Vup', 'Vdown', 'Delay'],
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
}
