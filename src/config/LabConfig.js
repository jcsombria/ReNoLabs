// Lab configuration
module.exports = {
  view: '766659be-5fd0-4efb-bb72-5607ad14a96b',
  controller: 'c_controller',
  info: {
    name: 'Circuitos - Configuración',
    description: '<h1>Práctica de Circuitos</h1>',
  },
  parameters: {
    reference: {
      parameter_names: ['Amplitud', 'Periodo', 'Offset Y', 'Offset T', 'Tipo'],
      options: [{
        name: 'Senoidal',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Cuadrada',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Triangular',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Impulse',
        parameter_indexes: [0, 1, 2]
      }, {
        name: 'Step',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Extern',
        parameter_indexes: [0, 1, 2, 3]
      }]
    },
    controller: {
      parameter_names: ['Manual', 'PID', 'Feedback Linearization', 'Sliding Mode'],
      options: [{
        name: 'kp',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Ti',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Td',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'N',
        parameter_indexes: [0, 1, 2]
      }, {
        name: 'Step',
        parameter_indexes: [0, 1, 2, 3]
      }, {
        name: 'Extern',
        parameter_indexes: [0, 1, 2, 3]
      }]
    },
  },

  model: {
    parameters: { // name, description, type, min, max, precision
      'Amplitud' : { description: "", type: "", min: 0, max: 0, precision: " " },
      'Periodo'  : { description: "", type: "", min: 0, max: 0, precision: " " },
      'Offset X' : { description: "", type: "", min: 0, max: 0, precision: " " },
      'Offset Y' : { description: "", type: "", min: 0, max: 0, precision: " " },
    },
    signals: {
      evolution : {
        type: 'array',
        cols: [ 'time', 'reference', 'control', 'output' ]
      }
    }
  },

  viewmodel: {
    elements: [{
        name: 'Grafo',
        type: 'graph',
        data: { 'x': 'evolution.time', 'y': 'evolution.control' },
      },
      {
        name: 'Opciones',
        type: 'options',
        data: {
          'Senoidal'   : [ 'Amplitud', 'Periodo', 'Offset X', 'Offset Y' ],
          'Cuadrada'   : [ 'Amplitud', 'Periodo', 'Offset X', 'Offset Y' ],
          'Triangular' : [ 'Amplitud', 'Periodo', 'Offset X', 'Offset Y' ],
          'Impulse'    : [ 'Amplitud', 'Periodo', 'Offset X' ],
          'Step'       : [ 'Amplitud', 'Periodo', 'Offset X', 'Offset Y' ],
          'Extern'     : [ 'Amplitud', 'Periodo', 'Offset X', 'Offset Y' ],
        },
      }
    ]
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
  },
}
