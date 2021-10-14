{
  function makeInteger(o) {
    return parseInt(o.join(''), 10);
  }
}

start
  = _ head:instruction tail:(_ @instruction _)* { return [head, ...tail]; } 

begin_point = '['
end_point   = ']'

instruction
  =
    I:assignment /
    I:instr_0op { return [I]; } /
    I:instr_1op _ A:operand { return [I, A]; } /
    I:instr_2op _ A:operand _ B:operand { return [I, A, B]; }

_ 'whitespace'
  = [ \t\n\r]*

assignment
  = A:identifier _ '=' _ B:point {return ['=', A, B]}
 
identifier
  = [A-Z]

point
  = begin_point _ X:number _ ',' _ Y:number _ ',' _ Z:number _ ',' _ R:number _ end_point { return [X,Y,Z,R]; }

instr_0op
  = 'open'i / 'close'i

instr_1op
  = 'mov'i

instr_2op
  = 'add'i

operand
  = identifier / point

number
  = digits:[0-9]+ { return makeInteger(digits); }
