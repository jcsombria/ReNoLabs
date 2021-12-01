const { IllegalArgumentError } = require("@influxdata/influxdb-client");
const { BIconThreeDotsVertical } = require("bootstrap-vue");

const grammar = `{
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
  = movement / assignment / flow / management

 _ 'whitespace'
  = [ \\t\\n\\r]+

movement 'Commands to move the robot'
  = I:('moved'i / 'move'i) _+ A:(point / identifier) _* { return [I.toUpperCase(), A]; } /
    I:'speed'i _+ A:integer _* { return ['SPEED', A]; } /
    I:('open'i / 'close'i / 'home'i / 'test'i) _* { return [I.toUpperCase()]; }

assignment 'Commands to define and manipulate positions and variables' 
  = I:('here'i / 'teach'i / 'delvar'i) _+ A:identifier _* { return [I.toUpperCase(), A]; } /
    I:('setpvc'i / 'setpv'i) _+ A:identifier '=' B:point _* { return [I.toUpperCase(), A, B]; } /
    'setp'i _+ A:identifier '=' B:identifier _* { return ['SETP', A, B]; } /
    'set'i _+ A:identifier '=' B:(identifier / number) _* OP:operation_2op _* C:(identifier / number) _* { return ['SET', A, [OP, B, C]]; } /
    'set'i _+ A:identifier '=' OP:operation_1op _* B:(identifier / number) _* { return ['SET', A, [OP, B]]; } /
    'set'i _+ A:identifier '=' B:(identifier / number) _* { return ['SET', A, B]; }

flow 'Flow control commands'
  = 'if'i _* C:if_condition _* I_T:instruction_list _* 'else'i _* I_E:instruction_list _* 'endif'i { return ['IF', C, I_T, I_E]; } /
    'for'i _* C:for_condition _* I:instruction_list _* 'endfor'i _* { return ['FOR', C, I]; }

management 'Management and user I/O commands'
  = 'print'i _* '"' msg:[^"]* '"' _+  { return ['PRINT', msg.join('')]; } /
    'println'i _* '"' msg:[^"]* '"' _* A:identifier? _* { return ['PRINT', msg.join(''), A]; }
    
identifier
  = ID:[A-Z|a-z]+ { return ID.join(''); }

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

  execute(context) {}
}

/**
 * Set a variable  
 */
class SetInstruction extends Instruction {
  execute(context) {
    var state = context.getState();
    state.set(this.args[0], state.compute(this.args[1]));
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Set a variable  
 */
class SetpvcInstruction extends Instruction {
  execute(context) {
    context.getState().set(this.args[0], this.args[1]);
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Set a variable  
 */
class SetpInstruction extends Instruction {
  execute(context) {
    context.getState().set(this.args[0], context.getState().get(this.args[1]));
    context.getLog().push(`Assign ${this.args[0]} to ${this.args[1]}`);
  }
}

/**
 * Move the robot to a posiion in cartesian coordinates
 */
class MoveInstruction extends Instruction {
  execute(context) {
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
  execute(context) {
    if (this.args[0] < 0 || this.args[0] > 100) {
      throw new RangeError("SPEED must be in the range (0, 100)");
    }
    context.getState().setGlobal('SPEED', this.args[0]); 
    context.getLog().push(`Set SPEED to ${this.args[0]}`);
  }
}

/**
 * Open the robot grip  
 */
class OpenInstruction extends Instruction {
  execute(context) {
    context.getState().setGlobal('GRIP', false);
    context.getLog().push(`Open grip`);
  }
}

/**
 * Close the robot grip  
 */
class CloseInstruction extends Instruction {
  execute(context) {
    context.getState().setGlobal('GRIP', true);
    context.getLog().push('Close grip');
  }
}

/**
 * If statement
 */
class IfInstruction extends Instruction {
  execute(context) {
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
  execute(context) {
    context.advance(this.args[0]);
  }
}

/**
 * Print a message in the context output 
 */
class PrintInstruction extends Instruction {
  execute(context) {
    context.print(this.args[0]);
  }
}

/**
 * Print a message in the context output 
 */
class DelvarInstruction extends Instruction {
  execute(context) {
    context.getState().unset(this.args[0]);
  }
}

/**
 * Home the robot 
 */
class HomeInstruction extends Instruction {
  async execute(context) {
    await context.getController().home();
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
    // instructions.push(['DELVAR', index]);
    return instructions.map(ACLVirtualMachine.createInstruction);
  }
}

class ACLVirtualMachine {
  static INSTRUCTIONS = {
    'SET': SetInstruction,
    'SETPVC': SetpvcInstruction,
    'SETP': SetpInstruction,
    'MOVE': MoveInstruction,
    'MOVED': MovedInstruction,
    'OPEN': OpenInstruction,
    'CLOSE': CloseInstruction,
    'SPEED': SpeedInstruction,
    'IF': IfInstruction,
    'ADV': AdvanceInstruction,
    'PRINT': PrintInstruction,
    'HOME': HomeInstruction,
    'DELVAR': DelvarInstruction
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

  async execute(program, controller) {
    this.state = new State();
    let context = new Context(program, controller, this.state, this.output);
    while (context.hasInstructions()) {
      var instruction = context.getNextInstruction();
      await instruction.execute(context);
      context.advance(1);
    }
    return true;
  };

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
    this.protected = [ 'SPEED', 'GRIP' ];
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
}

class Controller {
  async move(point) {
    
  }
  async moved(point) {}
  async speed() {}
  async open() {}
  async close() {}
  async home() {}
  async test() {}
  async setInput(i, value) {}
  async setOutput(i, value) {}
  async abort() {}
}


module.exports = { ACLVirtualMachine, State, Controller};