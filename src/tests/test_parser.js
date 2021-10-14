const peg = require('peggy');
const fs = require('fs');

try {
  var grammarFile = 'grammar.peggy';
  console.log(`Loading grammar: "${grammarFile}".`);
  var grammar = fs.readFileSync(grammarFile, 'utf-8');
  console.log('Building parser.');
  var parser = peg.generate(grammar);
  var inputFile = 'input.ace';
  console.log(`Loading input: "${inputFile}".`);
  var input = fs.readFileSync(inputFile, 'utf-8');
  console.log(`Parsing string: ${input}`);
  var result = parser.parse(input);
  console.log(result);
} catch(error) {
  console.error(error);
}
// var grammar =
//   "{ function makeInteger(o) { return parseInt(o.join(''), 10); } }\n" +
//   "start = instruction / instruction(_ instruction)+" + "\n" +
//   "instruction =" + "\n" + 
//   "  I:instr_0op { return [I]; } /" + "\n" +
//   "  I:instr_1op _ A:operand { return [I, A]; } /" + "\n" +
//   "  I:instr_2op _ A:operand _ B:operand { return [I, [A, B]]; }" + "\n" +
//   "_ 'whitespace' = [ \\t\\n\\r]+" + "\n" +
//   // "operand = point" + "\n";
//   "instr_0op = 'open'i / 'close'i" + "\n" +
//   "instr_1op = 'mov'i" + "\n" + 
//   "instr_2op = 'add'i" + "\n" +
//   "operand = X:number','Y:number','Z:number','R:number { return [X,Y,Z,R]; }" + "\n" + //  ',' R:number" + "\n";
//   "number = digits:[0-9]+ { return makeInteger(digits); }" + "\n";

  // console.log(grammar)
