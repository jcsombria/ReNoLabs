const ads = require('ads');

module.exports = {
  'config': {
    //Handle name in twincat
    symname: 'Main.ControlState',
    //An ads type object or an array of type objects.
    //You can also specify a number or an array of numbers,
    //the result will then be a buffer object.
    //If not defined, the default will be BOOL.
    bytelength: [ads.INT],
    elements: [1],
    //The property name where the value should be written.
    //This can be an array with the same length as the array length of byteLength.
    //If not defined, the default will be 'value'.
    propname: ['value'],
  },
  'evolution': {
    symname: 'Main.evolution',
    bytelength: [ads.REAL],
    propname: ['values'],
    elements: [14],
  },
  'referenceR': {
    symname: 'Main.referenciaR',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo','param'],
 	  elements: [1,4],
  },
  'referenceP': {
    symname: 'Main.referenciaP',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo','param'],
    elements: [1,4],
  },
  'referenceY': {
    symname: 'Main.referenciaY',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['Tipo', 'param'],
    elements: [1, 4],
  },
  'controller': {
    symname: 'Main.ControlData',
    bytelength: [ads.BYTE, ads.BYTE, ads.BYTE, ads.REAL],
    propname: ['Tipo', 'Continuous', 'RealSys', 'T'],
    elements: [1, 1, 1, 1],
  },
  'PIDpr': {
    symname: 'Main.PIDrp',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['bp', 'values'],
    elements: [1, 4],
  },
  'PIDy': {
    symname: 'Main.PIDy',
    bytelength: [ads.BYTE, ads.REAL],
    propname: ['bp', 'values'],
    elements: [1, 4],
  },
  'FL': {
    symname: 'Main.FLdat',
    bytelength: [ads.BYTE,ads.REAL,],
    propname: ['bp','K'],
    elements:[1, 12],
  },
  'Change': {
    symname: 'Main.Change',
    bytelength: ads.INT,
    elements:[1],
    //OPTIONAL: (These are set by default)
    transmissionMode: ads.NOTIFY.CYLCIC,
    //transmissionMode: ads.NOTIFY.ONCHANGE, (other option is ads.NOTIFY.CYLCIC)
    //maxDelay: 0,  -> Latest time (in ms) after which the event has finished
    cycleTime: 100 //-> Time (in ms) after which the PLC server checks whether the variable has changed
  },
  'UserUpdate': {
    symname: 'Main.UserUpdate',
    bytelength: [
	    ads.INT, // Sequence
      ads.INT, // ControlState
      [ads.BYTE], //ads.BYTE, ads.BYTE, ads.REAL], // ControlData
	    [ads.REAL], // EvolutionData
	    ads.BYTE, // referenciaR.Tipo
      [ads.REAL], // referenciaR.param
      ads.BYTE, // referenciaP.Tipo
      [ads.REAL], // referenciaP.param
      ads.BYTE, // referenciaY.Tipo
      [ads.REAL], // referenciaY.param
      [ads.BYTE], // PIDrp
      [ads.BYTE], // PIDy
      [ads.BYTE], // FLdat
    ],
    elements: [ // TO DO: auto generate description
      1,
      2,
      11,
      20*4, // 1+4+7+20*4 = 92
      1,
      7*4,
      1,
      7*4,
      1,
      7*4,
      14*4 + 2*1,
      14*4 + 2*1,
      1 + 18*4 + 6*4 + 1 + 5*4,
    ],
    propname: [
      'Sequence',
      'ControlState',
      'ControlData',
      'EvolutionData',
      'referenciaR.Tipo',
      'referenciaR.param',
      'referenciaP.Tipo',
      'referenciaP.param',
      'referenciaY.Tipo',
      'referenciaY.param',
      'PIDrp',
      'PIDy',
      'FLdat',
    ],
    transmissionMode: ads.NOTIFY.CYCLIC,
    //transmissionMode: ads.NOTIFY.ONCHANGE, (other option is ads.NOTIFY.CYLCIC)
    //maxDelay: 0,  -> Latest time (in ms) after which the event has finished
    cycleTime: 100 //-> Time (in ms) after which the PLC server checks whether the variable has changed
  },
};
