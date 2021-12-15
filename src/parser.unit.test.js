const { ACLVirtualMachine, Controller } = require('./parser');
const { hrtime } = require('process');
const { fail } = require('assert');
const { controller } = require('./config/LabConfig');

async function measure(f) {
  const start = hrtime.bigint();
  await f();
  const end = hrtime.bigint();
  return Number(end - start) / 1e6;
}


class TestController extends Controller {
  GET = [ 'DIN', 'DOUT', 'SPEED' ];

  constructor() {
    super();
    this.position = [0, 0, 0, 0];
    this.DIN = [0, 0];
    this.DOUT = [0, 0];
    this.SPEED = 100;
  }
  async move(point) {
    console.log('weeeee!');
    this.position = point; 
  }
  async moved(point) {
    console.log('weeeee...');
    await this.sleep(20);
    console.log('...eeeee!');
  }
  async speed(value) {
    this.SPEED = value;
  }
  async open() {
    console.log('¡abriendo, guey!');
  }
  async close() {
    console.log('cerrando, guey!');
  }
  async home() {
    await this.sleep(30);
  }
  async test() {

  }
  async setInput(i, value) {
    this.DIN[i] = value;
  }
  setOutput(i, value) {
    this.DOUT[i] = value;
  }
  async getOutput(i) {
    return (i != undefined) ? this.DOUT[i] : this.DOUT;
  }

  get(key) {
    if(!this.GET.includes(key)) {
      throw Error(`Undefined identifier: ${key}`);
    }
    return this[key];
  }

  async abort() {

  }
  getEffectorPosition() {
    return this.position;
  }
  getJointsPosition() {
    return this.position.map(x => 2*x);
  }
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

  test('HERE/TEACH', async () => {
    const code = `
      HERE posA
      TEACH posB
      SETP A=posA
      SETP B=posB
      PRINT "A: "
      PRINT "B: "
    `;
    var controller = new TestController();
    controller.move([1, 1, 1, 1]);
    expect(() => { state.get('A'); }).toThrow();
    var run = await this.vm.execute(code, controller);
    var state = this.vm.getState();
    console.log(this.vm.getOutput())
    expect(state.get('A')).toEqual([1, 1, 1, 1]);
    expect(state.get('A')).toEqual(state.get('posA'));
    expect(state.get('B')).toEqual([2, 2, 2, 2]);
    expect(state.get('B')).toEqual(state.get('posB'));
    expect(run).toBe(true);
  }),

  test('SET', async () => {
    const code = `
      SETPVC A=[1, 2.3, -5.8, 6.0]
      SETP B=A
      SET X=1
      SET Y=X*4
      DELVAR X
    `;
    var run = await this.vm.execute(code, new TestController());
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
    try {
      await this.vm.execute(`DELVAR SPEED `, new TestController());
      fail('Did not throw');
    } catch(e) {}
  });

  test('MOVE pos', async () => {
    const code = `
      SETPVC A=[1, 2.3, -5.8, 6.0]
      MOVE A
    `;
    var run = await this.vm.execute(code, new TestController());
    expect(this.vm.getState().get('A')).toEqual([1, 2.3, -5.8, 6.0]);
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
    var lapsed = await measure(async () => {
      return await this.vm.execute(code, new TestController());
    })
    expect(
      this.vm.getState().get('point')
    ).toEqual([0, 10, 1, -3.4]);
    expect(lapsed).toBeGreaterThan(20); // HOME + MOVED
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
    await this.vm.execute(`OPEN`, TestController);
    expect(
      this.vm.getState().get('GRIP')
    ).toBe(false);
    await this.vm.execute(`CLOSE`, new TestController());
    expect(
      this.vm.getState().get('GRIP')
    ).toBe(true);
  });

  test('IF', async () => {
    var code = `
      SETPVC A=[1, 1, 1, 1]
      SETPVC B=[1, 5, 1, 1]
      IF A=B
        SETPVC C=[1, 2, 3, 4]
      ELSE
        SETPVC C=[4, 3, 2, 1]
      ENDIF
    `;
    await this.vm.execute(code, new TestController());
    var state = this.vm.getState();
    expect(state.get('A')).toStrictEqual([1, 1, 1, 1]);
    expect(state.get('B')).toStrictEqual([1, 5, 1, 1]);
    expect(state.get('C')).toStrictEqual([4, 3, 2, 1]);

    var code = `
      SETPVC A=[1, 1, 1, 1]
      SETPVC B=[1, 5, 1, 1]
      IF A<>B
        SETPVC C=[1, 2, 3, 4]
      ELSE
        SETPVC C=[4, 3, 2, 1]
      ENDIF
    `;
    // console.log(program.getInstructions())
    await this.vm.execute(code, new TestController());
    var state = this.vm.getState();
    expect(state.get('A')).toStrictEqual([1, 1, 1, 1]);
    expect(state.get('B')).toStrictEqual([1, 5, 1, 1]);
    expect(state.get('C')).toStrictEqual([1, 2, 3, 4]);
  });

  test('FOR', async () => {
    var code = `
      SET X=2
      FOR i=1 TO 5
        SET X=X+2
      ENDFOR
    `;
    await this.vm.execute(code, new TestController());
    expect(this.vm.getState().get('X')).toStrictEqual(12);
  });


  test('DELAY', async () => {
    var lapsed = await measure(async () => {
      return await this.vm.execute(`DELAY 20 `, new TestController());
    });
    expect(lapsed).toBeGreaterThan(19);
  })

  test('SHOW', async () => {
    var code = `
      SHOW DIN
      SHOW DOUT
      SHOW SPEED
    `;
    var controller = new TestController();
    controller.setInput(0, 1);
    controller.setInput(1, 0);
    controller.setOutput(1, 0);
    await this.vm.execute(code, controller);
    expect(this.vm.getOutput()).toEqual(
      [ '[1,0]', '[0,0]', '[100]' ]
    );
  });

});
