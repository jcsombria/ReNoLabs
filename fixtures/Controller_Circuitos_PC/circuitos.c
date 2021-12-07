#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <pthread.h>
#include <math.h>
#include <sys/time.h>

const int ADC_PIN = 100;
const int DAC_PIN = 101;

char str[40] = {0};
char *token;

int status;

//external variables
float config = 1; //Configuration: 0: start/end, 1: ready, 2 run, 3 stop, 4 reset
float evolution[4] = {0, 0, 0, 0}; //Evolution data: time, ref, u, output
float reference[5] = {1, 2.5, 10, 0, 0}; //Reference signal: Type A T offsetA offsetT
float controller[6] = {0, 0, 0, 0, 0, 0};       //Controller: Manual/PID Kp Ki Kd N NS
int k = 0;
int temp_config = 1;

void traslate (float *var, char *token);
void *read_state (void *arg);
float reference_function (float *reference, float t);
float control_function (float *con,float T, float t,float rk,float yk,float vk);
void init(float *evolution,float *reference,float *controller);
float map(float, float, float, float, float);
float sat(float, float, float);
void writeOut(float);
float readIn();
void delay(int milliseconds);

int b ;
const float pi = 3.1415;

const int iTime=0;
const int iRef=1;
const int iCon=2;
const int iOut=3;

const float offsetOut=-0.2;
const float offsetIn=0;

struct timeval __millis_start;

void init_millis() {
    gettimeofday(&__millis_start, NULL);
};

unsigned long int millis() {
    long mtime, seconds, useconds; 
    struct timeval end;
    gettimeofday(&end, NULL);
    seconds  = end.tv_sec  - __millis_start.tv_sec;
    useconds = end.tv_usec - __millis_start.tv_usec;

    mtime = ((seconds) * 1000 + useconds/1000.0) + 0.5;
    return mtime;
};


int main (void) {
  float t0;
  float T=0.1;    //Periodo de muestro
  float Td=0.015; //Intervalo de espera entre lectura y escritura

  init_millis();
  init(evolution,reference,controller);
  pthread_t thread;
  pthread_create(&thread, NULL, read_state, NULL);

  printf("config: %g\n", config);
  fflush(stdout);
  delay(100);
  printf("reference: [%g, %g, %g, %g, %g]\n", reference[0], reference[1], reference[2], reference[3], reference[4]);
  fflush(stdout);
  delay(100);
  printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3], controller[4], controller[5]);
  fflush(stdout);
  delay(100);

  t0 = millis();

  while (config) {
    switch((int)config) {
      case 1 ://En espera
        t0 = millis();
        break;
      case 2: //Play
        evolution[iTime] = (millis() - t0)/1e3;
        //Se lee la entrada
        evolution[iOut] = readIn();
        evolution[iRef] = reference_function(&reference[0], evolution[0]);
        //El ultimo campo tiene que ser la otra entrada i2c.
        evolution[iCon] = control_function(controller, T, evolution[iTime], evolution[iRef], evolution[iOut], 0);
        delay(Td*1000); //JALO
        writeOut(evolution[iCon]);
        break;
      case 3: // Pause
        evolution[iTime] = (millis() - t0)/1e3;
        evolution[iOut] = readIn();
        delay(Td*1000); //JALO
        evolution[iRef] = 0;
        evolution[iCon] = 0;
        writeOut(evolution[iCon]);
        break;
      case 4:// Reset
        init(evolution, reference, controller);
        delay(100);
        printf("reference: [%g, %g, %g, %g, %g]\n", reference[0], reference[1], reference[2], reference[3], reference[4]);
        fflush(stdout);
        delay(50);
        printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3], controller[4], controller[5]);
        fflush(stdout);
        delay(50);
        config = 1;
        printf("config: %g\n", config);
        fflush(stdout);
        delay(50);
        writeOut(evolution[iCon]);
      break;
    }; //switch
    printf("evolution: [%0.3f, %0.3f, %0.3f, %0.3f]\n", evolution[0], evolution[1], evolution[2], evolution[3]);
    fflush(stdout);
    delay ((T-Td)*1000);
  }
  init(evolution, reference, controller);

  printf("config: %g\n", config);
  fflush(stdout);
  delay(100);
  printf("reference: [%g, %g, %g, %g, %g]\n", reference[0], reference[1], reference[2], reference[3], reference[4]);
  fflush(stdout);
  delay(100);
  printf("controller: [%0.3f, %0.3f, %0.3f, %0.3f, %0.3f, %0.3f]\n", controller[0], controller[1], controller[2], controller[3], controller[4], controller[5]);
  fflush(stdout);
  delay(100);
  printf("evolution: [%0.3f, %0.3f, %0.3f, %0.3f]\n", evolution[0], evolution[1], evolution[2], evolution[3]);
  fflush(stdout);

  evolution[iCon]=0.0;
  writeOut(evolution[iCon]);

  return 0;
}

/**
 * Read the ADC input connected to the plant.
 * \return The voltage read, in the range (-12, 12) V
 */
float readIn() {
  float u = map(512, 0, 1023.0, 0, 3.3);
  u =  (u - 1.612) / 0.1377;
  //return map(u, 0, 3.3, -12, 12);
  return u;
}

/**
 * Write the DAC output connected to the circuit.
 * \param value The voltage to write, in the range (-12, 12) V
 */
void writeOut(float value) {
  //float u = map(value, -12.0, 12.0, 0, 1023);
  float u = (value + 12.0741) / 5.9038;
  u = map(u, 0, 4.096, 0, 1023);
}

/**
 * Apply an affine transform to value: (x_min, x_max) -> (y_min, y_max)
 * \param  value The value to convert
 * \param  x_min The minimum value of the input range
 * \param  x_max The maximum value of the input range
 * \param  y_min The minimum value of the output range
 * \param  y_max The maximum value of the ouput range
 * \return       The value mapped to the range (y_min, y_max)
 */
float map(float value, float x_min, float x_max, float y_min, float y_max) {
  return (value - x_min) / (x_max - x_min) * (y_max - y_min) + y_min;
}

/**
 * Constrain value to the range (min, max).
 * \param  x_min The minimum value of the input range
 * \param  x_max The maximum value of the input range
 * \return       The voltage read, in the range (-12, 12) V
 */
float sat(float value, float min, float max) {
  return (value < min) ? min : (value > max) ? max : value;
}

/*
* Init function
*/
void init(float *evolution,float *reference,float *controller){
  evolution[0] = 0.0; evolution[1]=0.0; evolution[2]=0.0; evolution[3]=0.0;   //Evolution data
  reference[0] = 1; reference[1]=1; reference[2]=10; reference[3]=0; reference[4]=0;  //Reference
  controller[0]=0; controller[1]=0; controller[2]=0; controller[3]=0; controller[4]=0; controller[5]=1;
};

/*
 * Traslate function
 */
void traslate (float *var, char *data) {
  char *temp;
  int k = 0;
  temp = strtok(data, ",");
  while (temp != NULL) {
    *(var + k) = atof(temp);
    temp = strtok(NULL, ",");
    ++k;
  }
}

/*
 * Read function
 */
void *read_state (void *arg) {
  float referenceaux[5];
  int i;
  while(1) {
    read(0, &str, 40);
    token = strtok(str, ":");
    if (strcmp("config", token) == 0) {
      token = strtok(NULL, "");
      traslate (&config, token);
      printf("config: %g\n", config);
      fflush(stdout);
      delay(10);
      printf("config: %g\n", config);
      fflush(stdout);
    } else if (strcmp("reference", token) == 0) {
      token = strtok(NULL, "");
      traslate (&referenceaux[0], token);
      for (i=0; i<5; i++) {
        if (i!=2 || (i==2 && referenceaux[i]>0.0))
          reference[i]=referenceaux[i];
      }
      printf("reference: [%g, %g, %g, %g, %g]\n", reference[0], reference[1], reference[2], reference[3], reference[4]);
      fflush(stdout);
    } else if (strcmp("controller", token) == 0) {
      token = strtok(NULL, "");
      traslate (&controller[0], token);
      printf("controller: [%0.3f, %0.3f, %0.3f, %0.3f, %0.3f, %0.3f]\n", controller[0], controller[1], controller[2], controller[3], controller[4], controller[5]);
      fflush(stdout);
    } else if (strcmp("reset", token) == 0) {
      init(evolution,reference,controller);
      printf("reference: [%g, %g, %g, %g, %g]\n",reference[0], reference[1], reference[2], reference[3], reference[4]);
      fflush(stdout);
      delay(100);
      printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3], controller[4], controller[5]);
      fflush(stdout);
    }
    sleep(0.1);

    memset(str, 0, sizeof str);
  }
}

/*
 * Reference function
 */
float reference_function (float *reference, float t) {
  float output=0.0;
  static float tcambio=0.0;
  static int signo=1;
  float rem,rem2;

  switch( (int)reference[0]) {
    case 0 ://Seno
      output = reference[1]*sin(2*pi*t/reference[2]) + reference[3];
      break;
    case 1: //Cuadrada
      if (t-tcambio>reference[2]/2){
        tcambio=tcambio+reference[2]/2;
        signo=-signo;
      }
      output=signo*reference[1]+reference[3];
      break;
    case 2: //Triangular
      rem=remainderf(t, reference[2]);
      rem2=rem/reference[2];
      if (rem2>0) { //Estamos en la parte creciente
        output=reference[3]-reference[1]+4*reference[1]*rem2;
      } else {
        output=reference[3]+reference[1]-4*reference[1]*(rem2+0.5);
      }
    break;
    case 3: //Impulso
      if (t-tcambio>reference[2]) {
        tcambio=t+reference[2];
        signo=1;
      }
      if (signo) {
        output=reference[1];
        signo=0;
      } else {
        output=0;
      }
      break;
    case 4:
      output=reference[1];
      break;
    default:
      output = 0;
    }

    return output;
}


float control_function (float *cont,float T, float t,float rk,float yk,float vk) {
  float output=0.0;
  static float yk1=0.0;
  static float ui=0.0;
  static float ud=0.0;
  float N,NS,up,uin;
  float Kp,Ki,Kd,a;
  float b0,b1,b2,a1,a2;
  static float v[3] = {0, 0, 0};
  static float w[3] = {0, 0, 0};
  static int state = 0;

  switch( (int)cont[0]) {
    case 0: //Directo
      state = 0;
      output = rk;
      /*if (output>3) {
        output=3;
      } else if (output<-3) {
        out
put=3;
      }*/
      break;
    case 1:
      state = 1;
      Kp=cont[1];
      Ki=cont[2];
      Kd=cont[3];
      N=cont[4];
      NS=cont[5];
      up=Kp*(NS*rk-yk);
      uin=ui+Ki*T*(rk-yk);
      if (N>0) {
        a=N*T-1;
        ud=-a*ud-Kd*(yk-yk1);
      } else {
        ud=-Kd*vk;
      }
      output=up+uin+ud;
      if (output>12) {
        output=12;
        uin=ui;
      } else if (output<-12) {
        output=-12;
        uin=ui;
      }
      ui=uin;
      yk1=yk;
      break;
    case 2: // IIR
      if(state != 2) {
        state = 2;
        v[1] = v[2] = 0;
        w[1] = w[2] = 0;
      }
      b0=cont[1];
      b1=cont[2];
      b2=cont[3];
      a1=cont[4];
      a2=cont[5];
      v[0] = rk - yk;
      w[0] = - a1*w[1] - a2*w[2] + b0*v[0] + b1*v[1] + b2*v[2];
      v[2] = v[1];
      v[1] = v[0];
      w[2] = w[1];
      w[1] = w[0];

      output = sat(w[0], -9, 9);
      break;
    default:
      break;
  }
  return output;
}

void delay(int milliseconds) {
    long pause;
    clock_t now, then;

    pause = milliseconds*(CLOCKS_PER_SEC/1000);
    now = then = clock();
    while( (now-then) < pause )
        now = clock();
}
