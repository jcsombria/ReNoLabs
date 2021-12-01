const { ACLVirtualMachine, Controller } = require('./parser');
const { hrtime } = require('process');
const { fail } = require('assert');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class TestController extends Controller {
  async move(point) { console.log('weeeee!'); }
  async moved(point) { await sleep(20); }
  async speed(value) { this.value = value; }
  async open() {}
  async close() {}
  async home() { await sleep(30); }
  async test() {}
  async setInput(i, value) {}
  async setOutput(i, value) {}
  async abort() {}
}

describe('Test Parser', () => {
  beforeEach(() => {
    this.vm = new ACLVirtualMachine();
  });

  test('Calculator', () => {
    var state = this.vm.getState();
    expect(state.compute(['*', 2, 4])).toBe(8);
    expect(state.compute(['/', 28, 2])).toBe(14);
    expect(state.compute(['+', 7, -4])).toBe(3);
    expect(state.compute(['-', 34, 21])).toBe(13);
    expect(state.compute(['mod', 1, 5])).toBe(1);
    expect(state.compute(['not', 1])).toBe(-2);
    expect(state.compute(['or', 1, 0])).toBe(1);
    expect(state.compute(['and', 1, 1])).toBe(1);
  })

  test('SET', async () => {
    const code = `
      SETPVC A=[1, 2.3, -5.8, 6.0]
      SETP B=A
      SET X=1
      SET Y=X*4
      DELVAR X
    `;
    var program = this.vm.compile(code);
    var run = await this.vm.execute(program, new TestController());
    var state = this.vm.getState();
    
    expect(state.get('A')).toEqual([1, 2.3, -5.8, 6.0]);
    expect(state.get('B')).toEqual([1, 2.3, -5.8, 6.0]);
    expect(() => {
      state.get('X')
    }).toThrow(Error);
    expect(state.get('Y')).toEqual(4);
    expect(run).toBe(true);
  });

  test('Unset global identifier', async () => {
    var program = this.vm.compile(`DELVAR SPEED`);
    try {
      await this.vm.execute(program, new TestController());
      fail('Did not throw');
    } catch(e) {}
  });

  test('MOVE pos', async () => {
    const code = `
      SETPVC A=[1, 2.3, -5.8, 6.0]
      MOVE A
    `;
    var program = this.vm.compile(code);
    var run = await this.vm.execute(program, new TestController());
    var state = this.vm.getState();
    
    expect(state.get('A')).toEqual([1, 2.3, -5.8, 6.0]);
    expect(run).toBe(true);
  });

  test('MOVED + PRINT + HOME + SETPVC', async () => {
    const code = `
      HOME
      SETPVC point=[0, 10, 1, -3.4]
      PRINT "WAITING FOR MOVED"
      MOVED point
      PRINT "MOVED FINISHED"
    `;
    var program = this.vm.compile(code);
    const start = hrtime.bigint();
    await this.vm.execute(program, new TestController());
    const end = hrtime.bigint();
    lapsed = Number(end - start) / 1e6;
    expect(
      this.vm.getState().get('point')
    ).toEqual([0, 10, 1, -3.4]);
    expect(lapsed).toBeGreaterThan(40); // HOME + MOVED
    expect([
      "WAITING FOR MOVED",
      "MOVED FINISHED"
    ]).toEqual(this.vm.getOutput())
  });

  // test('SPEED val', async () => {
  //   const setSpeed = (async v => {
  //     var program = this.vm.compile(`SPEED ${v}`);
  //     await this.vm.execute(program, new TestController());
  //     return this.vm.getState().get('SPEED');
  //   }).bind(this);
  //   const validSpeeds = [0, 30, 50, 100];
  //   const invalidSpeeds = [-3, 103, [3000]];
  //   validSpeeds.forEach(async v => {
  //     var speed = await setSpeed(v); 
  //     expect(speed).toBe(v); 
  //   });
  //   invalidSpeeds.forEach(async v => {
  //     expect(async () => {
  //       await setSpeed(v)
  //     }).toThrow(RangeError);
  //   });
  // });

  test('OPEN/CLOSE', async () => {
    var program = this.vm.compile(`OPEN`);
    await this.vm.execute(program, TestController);
    expect(
      this.vm.getState().get('GRIP')
    ).toBe(false);

    var program = this.vm.compile(`CLOSE`);
    await this.vm.execute(program, new TestController());
    expect(
      this.vm.getState().get('GRIP')
    ).toBe(true);
  });

  test('IF', async () => {
    var program = this.vm.compile(`
      SETPVC A=[1, 1, 1, 1]
      SETPVC B=[1, 5, 1, 1]
      IF A=B
        SETPVC C=[1, 2, 3, 4]
      ELSE
        SETPVC C=[4, 3, 2, 1]
      ENDIF
    `);
    await this.vm.execute(program, new TestController());
    state = this.vm.getState();
    expect(state.get('A')).toStrictEqual([1, 1, 1, 1]);
    expect(state.get('B')).toStrictEqual([1, 5, 1, 1]);
    expect(state.get('C')).toStrictEqual([4, 3, 2, 1]);

    var program = this.vm.compile(`
      SETPVC A=[1, 1, 1, 1]
      SETPVC B=[1, 5, 1, 1]
      IF A<>B
        SETPVC C=[1, 2, 3, 4]
      ELSE
        SETPVC C=[4, 3, 2, 1]
      ENDIF
    `);
    // console.log(program.getInstructions())
    await this.vm.execute(program, new TestController());
    state = this.vm.getState();
    expect(state.get('A')).toStrictEqual([1, 1, 1, 1]);
    expect(state.get('B')).toStrictEqual([1, 5, 1, 1]);
    expect(state.get('C')).toStrictEqual([1, 2, 3, 4]);
  });

  test('FOR', async () => {
    var program = this.vm.compile(`
      SET X=2
      FOR i=1 TO 5
        SET X=X+2
      ENDFOR
    `);
    await this.vm.execute(program, new TestController());
    state = this.vm.getState();
    expect(state.get('X')).toStrictEqual(12);
  });

});
