const grammar = `{
  var KEYWORDS = [
    'moved',
    'move',
    'open',
    'close',
    'home',
    'test',
    'here',
    'teach',
    'delvar',
    'setpvc',
    'setpv',
    'setp', 
    'set',
    'if',
    'else',
    'endif',
    'for',
    'endfor',
    'print',
    'println'
  ];

  var PROTECTED = [
    'din',
    'dout',
    'enco',
    'speed'
  ]

  function isKeyword(word) {
    return KEYWORDS.includes(word.toLowerCase());
  };

  function isProtected(word) {
    return PROTECTED.includes(word.toLowerCase());
  };

  function makeNumber(sign, integer, decimal) {
    var number =  (sign ? sign : '') 
                + (integer ? integer.join('') : '')
                + (decimal ? decimal.join('') : '');
    return Number.parseFloat(number);
  };

  function makeInteger(sign, integer) {
    return makeNumber(sign, integer);
  };
}

instruction_list
  = _* head:instruction tail:(_* @instruction _*)* { return [head, ...tail]; }

begin_point     = '['
end_point       = ']'
operator        = '<>' / '<=' / '<' / '>=' / '>' / '='
operation_1op   = 'not'i / 'sin'i / 'cos'i
operation_2op   = '+' / '-' / '*' / '/'

instruction
  = movement / assignment / flow / user

 _ 'whitespace'
  = [ \\t\\n\\r]+

KEYWORD
  = 'moved'i /
    'move'i /
    'speed'i /
    'open'i /
    'close'i /
    'home'i /
    'test'i /
    'here'i /
    'teach'i /
    'delvar'i /
    'setpvc'i /
    'setpv'i /
    'setp'i / 
    'set'i /
    'if'i /
    'else'i /
    'endif'i /
    'for'i /
    'endfor'i /
    'print'i /
    'println'i

movement
  = I:('moved'i / 'move'i) _+ A:(point / identifier) _* { return [I.toUpperCase(), A]; } /
    I:'speed'i _+ A:integer _* { return [I.toUpperCase(), A]; } /
    I:('open'i / 'close'i / 'home'i / 'test'i) _* { return [I.toUpperCase()]; }

assignment
  = I:('here'i / 'teach'i / 'delvar'i) _ A:identifier _ { return [I.toUpperCase(), A]; } /
    I:('setpvc'i / 'setpv'i) _ A:identifier '=' B:point _ { return [I.toUpperCase(), A, B]; } /
    'setp'i _ A:identifier _* '=' _* B:identifier _ { return ['SETP', A, B]; } /
    'set'i  _ A:identifier _* '=' _* B:(identifier / number) _* OP:operation_2op _* C:(identifier / number) _ { return ['SET', A, [OP, B, C]]; } /
    'set'i  _ A:identifier _* '=' _* OP:operation_1op _* B:(identifier / number) _ { return ['SET', A, [OP, B]]; } /
    'set'i  _ A:identifier _* '=' _* B:(identifier / number) _ { return ['SET', A, B]; }

flow
  = 'if'i _ C:if_condition _* I_T:instruction_list _* 'else'i _* I_E:instruction_list _* 'endif'i _ { return ['IF', C, I_T, I_E]; } /
    'for'i _ C:for_condition _* I:instruction_list _* 'endfor'i _ { return ['FOR', C, I]; } /
    I:('delay'i) _ A:integer _ { return [I.toUpperCase(), A]; } /
    I:('abort'i / 'stop'i) _ { return [I.toUpperCase()]; }

user
  = I:'print'i _ '"' msg:[^"]* '"' _ A:(@identifier _)? { return A ? [I, msg.join(''), A]: [I, msg.join('')]; } /
    I:'println'i _ '"' msg:[^"]* '"' _ A:identifier? _ { return [I, msg.join(''), A]; } /
    I:'show'i _ A:identifier &{ return isProtected(A); } _ { return [I.toUpperCase(), A]; }
    
identifier
  = ID:[A-Z|a-z]+ &{ return !isKeyword(ID.join('')); } { return ID.join(''); }

point
  = begin_point _* X:number _* ',' _* Y:number _* ',' _* Z:number _* ',' _* R:number _* end_point { return [X,Y,Z,R]; }

if_condition
  = O1:operand _* OP:operator _* O2:operand { return [OP, O1, O2] }

operand
  = identifier / point / integer

for_condition
  = A:identifier '=' i:integer _* 'to'i _* j:integer _* { return [A, i, j]; }

integer
  = s:[+|-]? n:[0-9]+ { return makeInteger(s, n); }
  
number
  = [+-]? ('0' / [1-9][0-9]*) (\.[0-9]+)? { return parseFloat(text()); }

`;

var peggy = peggy || require("peggy");

class Instruction {
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }

  getName() {
    return this.name;
  }

  getArgs() {
    return this.args;
  }

  async execute(context) {}
}

/**
 * Set a variable  
 */
class SetInstruction extends Instruction {
  async execute(context) {
    var state = context.getState();
    state.set(this.args[0], state.compute(this.args[1]));
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Set a variable  
 */
class SetpvcInstruction extends Instruction {
  async execute(context) {
    context.getState().set(this.args[0], this.args[1]);
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Set a variable  
 */
class SetpInstruction extends Instruction {
  async execute(context) {
    context.getState().set(this.args[0], context.getState().get(this.args[1]));
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Move the robot to a posiion in cartesian coordinates
 */
class MoveInstruction extends Instruction {
  async execute(context) {
    var point;
    if (typeof this.args[0] == 'string') {
      var point = context.getState().get(this.args[0]);
      if (!point) {
        context.getLog().push(`Unknown identifier: ${this.args[0]}`);
        return;
      }
    } else {
      point = this.args[0];
    }
    context.getLog().push(`Move to ${point}`);
    context.getController().move(point);
  }
}

/**
 * Move the robot to a point in joint coordinates   
 */
class MovedInstruction extends Instruction {
  async execute(context) {
    var point = context.getState().get(this.args[0]);
    await context.getController().moved(point);
  }
}

/**
 * Set the robot speed  
 */
class SpeedInstruction extends Instruction {
  async execute(context) {
    if (this.args[0] < 0 || this.args[0] > 100) {
      throw new RangeError("SPEED must be in the range (0, 100)");
    }
    context.getState().setGlobal('SPEED', this.args[0]); 
    context.getLog().push(`Set SPEED to ${this.args[0]}`);
  }
}

/**
 * Stores the position of the robot (in cartesian coordinates) in a variable 
 */
class HereInstruction extends Instruction {
  async execute(context) {
    context.getState().set(this.args[0], context.getController().getEffectorPosition());
    context.getLog().push(`Storing Cartesian position in ${this.args[0]}`);
  }
}

/**
 * Stores the position of the robot in (joints coordinates) in a variable 
 */
class TeachInstruction extends Instruction {
  async execute(context) {
    context.getState().set(this.args[0], context.getController().getJointsPosition());
    context.getLog().push(`Storing Cartesian position in ${this.args[0]}`);
  }
}

/**
 * Open the robot grip  
 */
class OpenInstruction extends Instruction {
  async execute(context) {
    context.getState().setGlobal('GRIP', false);
    context.getController().open();
    context.getLog().push(`Open grip`);
  }
}

/**
 * Close the robot grip  
 */
class CloseInstruction extends Instruction {
  async execute(context) {
    context.getState().setGlobal('GRIP', true);
    context.getController().close();
    context.getLog().push('Close grip');
  }
}

/**
 * If statement
 */
class IfInstruction extends Instruction {
  async execute(context) {
    if(!this.check(this.args[0], context)) {
      context.advance(this.args[1]);
    } 
    context.getLog().push(`IF Condition: ${this.args[0]}`);
  }

  // TO DO: Move to State?
  check(condition, context) {
    let operation = condition[0];
    let operand1 = condition[1];
    let operand2 = condition[2];
    const OPERATIONS = {
      '=': this.equals.bind(this),
      '<>': this.notEquals.bind(this),
      '>': this.greater.bind(this),
      '<': this.less.bind(this),
      '<=': this.lessThanOrEqual.bind(this),
      '>=': this.greaterThanOrEqual.bind(this),
    };
    var result = OPERATIONS[operation](operand1, operand2, context);
    return result;
  }
  
  equals(A, B, context) {
    var op1 = A, op2 = B;
    if (typeof(A) == 'string') { op1 = context.getState().get(A); }
    if (typeof(B) == 'string') { op2 = context.getState().get(B); }
    return (op1.length == op2.length) && op1.every((e, i) => { return e == op2[i]; });
  }

  notEquals(A, B, context) {
    return !this.equals(A, B, context);
  }

  getValue(A, context) {
    if (typeof(A) == 'string') {
      return context.getState().get(A);
    }
    return A;
  }

  greater(A, B, context) {
    return this.getValue(A, context) > this.getValue(B, context);
  }

  less(A, B, context) {
    return this.getValue(A, context) < this.getValue(B, context);
  }

  greaterThanOrEqual(A, B, context) {
    return this.getValue(A, context) >= this.getValue(B, context);
  }

  lessThanOrEqual(A, B, context) {
    return this.getValue(A, context) <= this.getValue(B, context);
  }
}

/**
 * Advance program counter 
 */
class AdvanceInstruction extends Instruction {
  async execute(context) {
    context.advance(this.args[0]);
  }
}

/**
 * Print a message in the context output 
 */
class PrintInstruction extends Instruction {
  async execute(context) {
    var message = this.args[0];
    if (this.args.length > 1) {
      message = this.args[0].replace(
        '%s', context.getState().get(this.args[1])
      );
    }   
    context.print(message);
    context.getController().print(message);
  }
}

/**
 * Print a message in the context output 
 */
 class PrintlnInstruction extends PrintInstruction {
  async execute(context) {
    this.args[0] += '\n';
    super.execute(context);
  }
}

/**
 * Print a protected variable in the context output and 
 * stores its value in the execution context.
 */
class ShowInstruction extends Instruction {
  async execute(context) {
    console.log('SHOW'); 
    console.log(this.args[0]); 
    var value = context.getController().get(this.args[0]);
    context.getState().setGlobal(this.args[0], value);
    context.print(`[${value}]`);
  }
}

/**
 * Print a message in the context output 
 */
class DelvarInstruction extends Instruction {
  async execute(context) {
    context.getState().unset(this.args[0]);
  }
}

/**
 * Home the robot 
 */
class HomeInstruction extends Instruction {
  async execute(context) {
    context.getController().home();
  }
}

/**
 * Home the robot 
 */
class AbortInstruction extends Instruction {
  async execute(context) {
    context.getController().stop();
    context.stop();
  }
}

/**
 * Home the robot 
 */
class StopInstruction extends Instruction {
  async execute(context) {
    context.getController().stop();
  }
}

/**
 * Home the robot 
 */
class DelayInstruction extends Instruction {
  async execute(context) {
    await context.getController().sleep(this.args[0]);
  }
}

/**
 * A compiled program
 */
class Program {
  constructor() {
    this.instructions = [];
  }

  addInstructions(instructions) {
    let instrs = this.instructions;
    instructions.forEach(i => { instrs.push(i) })
  }

  getInstructions() {
    return this.instructions;
  }

  getInstruction(n) {
    if (n < 0 || n > this.instructions.length) {
      throw new RangeError('Invalid instruction index.');
    }
    return this.instructions[n];
  }
}

/**
 * An execution context contains information about the execution state of a program.
 */
class Context {

  constructor(program, controller, state, output) {
    this.program = program;
    this.state = state;
    this.controller = controller;
    this.output = output;
    this.log = [];
    this.pointer = 0;
  }

  advance(n) {
    this.pointer += n;
  }

  getNextInstruction() {
    if (!this.hasInstructions()){
      return;
    }
    return this.program.getInstruction(this.pointer);
  }

  getState() {
    return this.state;
  }

  getProgram() {
    return this.program;
  }

  getController() {
    if (!this.controller) {
      this.controller = new Controller();
    }
    return this.controller;
  }

  getOutput() {
    return this.output;
  }

  getLog() {
    return this.log;
  }

  hasInstructions() {
    return this.pointer >= 0 && this.pointer < this.program.getInstructions().length;
  }

  print(message) {
    this.output.push(message);
  }
}

/**
 * An statement maps to one or more instructions.
 */
class Statement {
  constructor(statement) {
    this.statement = statement;
  }

  getName() {
    return this.statement[0];
  }

  getArgs() {
    return this.statement.slice(1);
  }

  getArg(i) {
    if(i<0 || i>=(this.statement.length-1)) { return }
    return this.statement[i+1];
  }

  /**
   * Convert a statement into a list of primitive instructions. 
   * @returns Array of instructions
   */
  flatten() {
    return [ACLVirtualMachine.createInstruction(this.statement)];
  }
}

class IfStatement extends Statement {
  flatten() {
    var instructions = [
      [this.getName(), this.getArg(0), this.getArg(1).length+1]
    ]; // IF
    this.getArg(1).forEach(v => { instructions.push(v) }); // THEN
    instructions.push(['ADV', this.getArg(2).length]);
    this.getArg(2).forEach(v => { instructions.push(v) }); // ELSE
    return instructions.map(ACLVirtualMachine.createInstruction);
  }
}

class ForStatement extends Statement {
  flatten() {
    var index = this.getArg(0)[0],
        start = this.getArg(0)[1],
        end = this.getArg(0)[2],
        body = this.getArg(1);
    var instructions = [
      ['SET', index, start],
      ['IF', ['<=', index, end], body.length+3]
    ];
    body.forEach(v => {instructions.push(v)});
    instructions.push(['SET', index, ['+', index, 1] ]);
    instructions.push(['ADV', -(body.length + 3)]);
    instructions.push(['DELVAR', index]);
    return instructions.map(ACLVirtualMachine.createInstruction);
  }
}

class ACLVirtualMachine {
  static INSTRUCTIONS = {
    // Movement
    'MOVE': MoveInstruction,
    'MOVED': MovedInstruction,
    'SPEED': SpeedInstruction,
    'OPEN': OpenInstruction,
    'CLOSE': CloseInstruction,
    'HOME': HomeInstruction,
    // 'TEST': TestInstruction,
    // Variables
    'HERE': HereInstruction,
    'TEACH': TeachInstruction,
    // 'SETPV': SetpvInstruction,
    'SETPVC': SetpvcInstruction,
    'SETP': SetpInstruction,
    'SET': SetInstruction,
    'DELVAR': DelvarInstruction,
    // Flow
    'IF': IfInstruction,
    'ADV': AdvanceInstruction,
    // 'LABEL': LabelInstruction,
    // 'GOTO': GotoInstruction,
    'ABORT': AbortInstruction,
    'STOP': StopInstruction,
    'DELAY': DelayInstruction,
    // User I/O
    'PRINT': PrintInstruction,
    'PRINTLN': PrintlnInstruction,
    'SHOW': ShowInstruction,
    // 'READ': ReadInstruction,
    // 'GET': GetInstruction,
  };

  static STATEMENTS = {
    'FOR': ForStatement,
    'IF': IfStatement
  }

  static createInstruction(info) {
    var name = info[0];
    var args = info.slice(1);
    if (!(name in ACLVirtualMachine.INSTRUCTIONS)) {
      throw Error(`Invalid Instruction: ${name}`);
    }
    var instr = new ACLVirtualMachine.INSTRUCTIONS[name](name, args);
    return instr;
  }

  static createStatement(info) {
    var name = info[0];
    if(!(name in ACLVirtualMachine.STATEMENTS)) {
      return new Statement(info);
    }
    return new ACLVirtualMachine.STATEMENTS[name](info);
  }

  constructor() {
    this.parser = peggy.generate(grammar);
    this.state = new State();
    this.log = [];
    this.output = [];
  }

  compile(code) {
    var program = new Program();
    var instructions = this.parser.parse(code);
    instructions.forEach(i => {
      program.addInstructions(
        ACLVirtualMachine.createStatement(i).flatten()
      );
    });
    return program;
  };

  async execute(runnable, controller, clearStateBeforeRun) {
    var program = typeof runnable === 'string' ? this.compile(runnable) : runnable;
    if (clearStateBeforeRun) {
      this.getState().clear();
    }
    let context = new Context(program, controller, this.state, this.output);
    while (context.hasInstructions()) {
      var instruction = context.getNextInstruction();
      await instruction.execute(context);
      context.advance(1);
    }
    return true;
  }

  getState() {
    return this.state;
  }

  getOutput() {
    return this.output;
  }  
}

/**
 * Represents the state of an interpreter. 
 */
class State {
  static OPERATIONS = {
    '*': (x, y) => { return x * y; }, 
    '+': (x, y) => { return x + y; },
    '/': (x, y) => { return x / y; },
    '-': (x, y) => { return x - y; },
    'mod': (x, y) => { return x % y; },
    'or': (x, y) => { return x | y; },
    'not': x => { return ~x; },
    'and': (x, y) => { return x & y; },
    // 'sin': (x, y) => { return x / y; },
    // 'cos': (x, y) => { return x - y; },
    // 'log': (x, y) => { return x / y; },
    // 'exp': (x, y) => { return x - y; },
  }

  constructor() {
    this.state = {};
    this.protected = [ 'SPEED', 'GRIP', 'DIN', 'DOUT' ];
  }

  get(key) {
    if(!this.has(key)) {
      throw new Error(`Undefined identifier: ${key}`);
    }
    return this.state[key];
  }

  has(identifier) {
    return (identifier in this.state || identifier in this.protected);
  }

  set(key, value) {
    if(this.isGlobalIdentifier(key)) {
      throw new Error(`${key} is a global identifier.`);
    }
    if(!this.isIdentifier(key)) {
      throw new Error(`${key} is not a valid identifier.`);
    }
    this.state[key] = value;
  }

  setGlobal(key, value) {
    if(!this.isGlobalIdentifier(key)) {
      throw new Error(`${key} is not a global identifier.`);
    }
    this.state[key] = value;
  }

  isGlobalIdentifier(key) {
    return this.protected.includes(key);
  }

  isIdentifier(key) {
    try {
      return key.match(/^[A-Z|a-z]+$/) != null;
    } catch(e) {
      return false;
    }
  }

  compute(expression) {
    if(!Array.isArray(expression)) {
      if(this.isIdentifier(expression) || this.isGlobalIdentifier(expression)) {
        return this.get(expression);
      }
      return expression;
    }

    var operation = expression[0],
        operand1 = this.compute(expression[1]),
        operand2 = this.compute(expression[2]);
    return State.OPERATIONS[operation](operand1, operand2);
  }

  unset(key) {
    if(this.isGlobalIdentifier(key)) {
      throw new Error('Cannot unset global identifier.');
    }
    if(!this.has(key)) {
      return;
    }
    delete this.state[key];
  }

  clear() {
    this.state = {};
  }
}

class Controller {
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async move(point) {}
  async moved(point) {}
  async speed() {}
  async open() {}
  async close() {}
  async home() {}
  async test() {}
  async setInput(i, value) {}
  async setOutput(i, value) {}
  async abort() {}
  getEffectorPosition() {}
  getJointsPosition() {}
}

//module.exports = { ACLVirtualMachine, State, Controller};