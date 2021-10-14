// Lab configuration
module.exports = {
  view: '61072736-72bd-4751-b43f-0e10a27d7405',
  controller: 'c_controller',
  info: {
    name: 'Circuitos - Configuración 1',
    description: '<h1>Práctica de Circuitos</h1><p>Lab description</p>',
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
