import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn
import re
import threading
import time
import zmq
from math import sin

# Init SPI
def init_SPI():
    spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)
    cs = digitalio.DigitalInOut(board.D5)
    mcp = MCP.MCP3008(spi, cs)
    channel = AnalogIn(mcp, MCP.P1)

# Init socket
def init_socket():
    global socket, notify
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    notify = context.socket(zmq.PUB)
    socket.bind("tcp://127.0.0.1:5555")
    notify.bind("tcp://127.0.0.1:5556")

# Read
def read():
    global salir
    
    p = [SIN, 1, 1, 0]
    state = [0, 0, 0, 0, 0]
    t = 0
    dt = 0.01*1e9
    while (salir==0):
        try:
            t = time.perf_counter_ns()
            u, state = reference(t, params=p, state=state)
            msg = 'evolution:[%s,%s]' % (t/1e9, u)
            notify.send_string(msg)
            now = time.perf_counter_ns()
            wait = t + dt - now
            time.sleep(wait / 1e9)
        except:
            pass

SIN = 0
SQUARE = 1
TRIANGLE = 2
IMPULSE = 3
pi = 3.1416
def reference(t, params=[0, 1, 1, 0], state=[0, 0, 0]):
    option = params[0]
    if option == SIN:
        u = params[1]*sin(2*pi*t/params[2]) + params[3]
    elif option == SQUARE:
        mode, tcambio, signo = state
        if not mode == SQUARE:
            tcambio = 0.0
            signo = 1
        if (t-tcambio>params[2]/2): 
            tcambio = tcambio + params[2]/2
            signo = -signo
        u = signo*params[1] + params[3]
    elif option == TRIANGLE:
        u = 0.0
      #rem = remainderf(t, reference[2]);
      #rem2 = rem/reference[2];
      #if (rem2>0) { //Estamos en la parte creciente
      #  output=reference[3]-reference[1]+4*reference[1]*rem2;
      #} else {
      #  output=reference[3]+reference[1]-4*reference[1]*(rem2+0.5);
      #}
    elif option == IMPULSE:
        if (t-tcambio > params[2]):
            tcambio = t + params[2]
            signo = 1
            if signo:
                u = params[1]
                signo = 0
            else:
                u = 0
    elif option == EXTERN:
      u = reference[1]

    return u, state

def sat(x, x_min, x_max):
    if x < x_min:
        return x_min
    if x > x_max:
        return x_max
    return x

FEEDTHROUGH = 0
PID = 1
IIR = 2
yk1 = 0.0
ui = 0.0
ud = 0.0
v = [0, 0, 0]
w = [0, 0, 0]
def control(params, T, t, rk, yk, vk):
    option = params[0]
    if option == FEEDTHROUGH:
        u = rk
   
    elif option == PID:
        Kp, Ki, Kd, N, NS = params[1:5]
        up = Kp*(NS*rk - yk)
        uin = ui + Ki*T*(rk-yk)
        if N > 0:
            a = N*T - 1
            ud = -a*ud - Kd*(yk-yk1)
        else:
            ud = -Kd*vk
        u = up + uin + ud
        v = sat(u, -12, 12)
        if v != u: 
            uin = ui
        ui = uin
        yk1 = yk

    elif option == IIR:
        b0, b1, b2, a1, a2 = params[1:5]
        v[0] = rk - yk
        w[0] = - a1*w[1] - a2*w[2] +  b0*v[0] + b1*v[1] + b2*v[2]
        v[2] = v[1]
        v[1] = v[0]
        w[2] = w[1]
        w[1] = w[0]
        u = sat(w[0], -12, 12)
    
    return u;

# Parse command string ('<name>: [1, ...]') and extract elements. 
def parse_string(s):
    try:
        v = re.match('(.*):\s*\[(.*)\]', s).groups()
        name = v[0]
        values = v[1].split(',')
        id = int(values[0])
        args = [float(a) for a in values[1:]]
        return {
            'task_name': name,
            'task_id': id,
            'task_args': args,
        }
    except:
        print('[Error] Invalid format')
        return None
    
if __name__ == "__main__":
    global salir, socket, notify
    salir = False
    current_time = time.perf_counter_ns()
    init_SPI()
    init_socket()
    # Wait for commands
    print("Python Controller is listening\n")
    #  Wait for next request from client
    task = threading.Thread(target=read)
    task.start()
    while not salir:
        message = socket.recv_string()
        print("Received request: %s" % message)
        command = parse_string(message)
        try:
            name = command['task_name']
            id = command['task_id']
            args = command['task_args']
            if name == 'config' and id == 0:
                salir = True
            #elif name == 'action':
            #    task = TASKS[id]
            #    hilo_tarea = threading.Thread(target=task, args=([device] + args))
            #    hilo_tarea.start()
            print("Action Completed.\n")
        except:
            print('[Error] Invalid command.\n')
        socket.send_string(message)
    print('Bye!!')