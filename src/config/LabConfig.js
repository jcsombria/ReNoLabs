// Lab configuration
module.exports = {
  info: {
    name: 'VRLABS-ISA',
    description: '<h1>Plataforma VRLABS-ROBOTARIUM</h1>',
  },
  parameters: {
    reference: {
      parameter_names: ['Amplitud', 'Periodo', 'Offset Y', 'Offset T', 'Tipo'],
      options: [
        {
          name: 'Senoidal',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Cuadrada',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Triangular',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Impulse',
          parameter_indexes: [0, 1, 2],
        },
        {
          name: 'Step',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Extern',
          parameter_indexes: [0, 1, 2, 3],
        },
      ],
    },
    controller: {
      parameter_names: [
        'Manual',
        'PID',
        'Feedback Linearization',
        'Sliding Mode',
      ],
      options: [
        {
          name: 'kp',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Ti',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Td',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'N',
          parameter_indexes: [0, 1, 2],
        },
        {
          name: 'Step',
          parameter_indexes: [0, 1, 2, 3],
        },
        {
          name: 'Extern',
          parameter_indexes: [0, 1, 2, 3],
        },
      ],
    },
  },

  model: {
    writables: {
      Tipo: {
        name: 'Tipo',
        description: 'Amplitud de la señal a generar',
        type: 'set',
        choices: [
          'Senoidal',
          'Cuadrada',
          'Triangular',
          'Impulse',
          'Step',
          'Extern',
        ],
        value: 'Senoidal',
        new_value: 'Senoidal',
      },
      Amplitud: {
        name: 'Amplitud',
        description: 'Amplitud de la señal a generar',
        type: 'float',
        min: '-12',
        max: '+12',
        precision: '0.01',
        value: 0,
        new_value: 0,
      },
      Periodo: {
        name: 'Periodo',
        description: 'Periodo de la señal a generar',
        type: 'float',
        min: '0.02',
        max: 'Inf',
        precision: '0.01',
        value: 0,
        new_value: 0,
      },
      'Offset Y': {
        name: 'Offset Y',
        description: 'Desviación en amplitud de la señal generar',
        type: 'float',
        min: '0',
        max: 'Inf',
        precision: '0',
        value: 0,
        new_value: 0,
      },
      'Offset T': {
        name: 'Offset T',
        description: 'Desviación en el tiempo de la señal a generar',
        type: 'float',
        min: '0',
        max: 'Inf',
        precision: '0',
        value: 0,
        new_value: 0,
      },
    },

    parameters: {
      // name, description, type, min, max, precision
      Amplitud: { description: '', type: '', min: 0, max: 0, precision: ' ' },
      Periodo: { description: '', type: '', min: 0, max: 0, precision: ' ' },
      'Offset X': { description: '', type: '', min: 0, max: 0, precision: ' ' },
      'Offset Y': { description: '', type: '', min: 0, max: 0, precision: ' ' },
    },

    signals: {
      evolution: {
        type: 'array',
        cols: ['time', 'reference', 'control', 'output'],
      },
    },
  },

  viewmodel: {
    graphs: [
      {
        title: 'Entrada/Salida',
        properties: { x_auto: true, y_auto: false },
        signals: {
          u: { x_axis: 'time', y_axis: 'u', show: true },
          ref: { x_axis: 'time', y_axis: 'y', show: true },
        },
      },
      {
        title: 'Lissajous',
        properties: { x_auto: false, y_auto: false },
        signals: {
          lissajous: { x_axis: 'u', y_axis: 'y', show: true },
        },
      },
    ],

    controls: [
      {
        name: 'Entrada',
        elements: ['Tipo', 'Amplitud', 'Periodo', 'Offset Y', 'Offset T'],
      },
    ],
  },

  signals: {
    i: [
      {
        name: 'SetPoint',
        type: 'double',
        value: 0.0,
      },
    ],
    o: [
      {
        name: 'Time',
        type: 'double',
        value: 0.0,
      },
      {
        name: 'Output',
        type: 'double',
        value: 0.0,
      },
    ],
  },
};
