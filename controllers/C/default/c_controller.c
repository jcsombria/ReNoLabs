#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <pthread.h>
#include <math.h>
#include <wiringPi.h>

// State variables
float config        = 1;                    //Configuration: 0: start/end, 1: ready, 2 run, 3 stop, 4 reset
float evolution[4]  = {0.0, 0.0, 0.0, 0.0}; //Evolution data: time, control(ON/OFF), state, level
float simulation[4] = {0.0, 0.0, 0.0, 0.0}; //Simulation: dummy, v_up, v_down, delay
float controller[4] = {0.0, 0.0, 0.0, 0.0}; //Controller: single/double, threshold, min, max

float automaton[3]  = {0.0, 0.0, 0.0};           //Automaton: state, h, t

int  sendState = 0;

// Default state variables
static const float default_config        = 1;
static const float default_evolution[4]  = {0.0, 0.0, 0.0, 0.0};
static const float default_simulation[4] = {0.0, 1.0, 2.0, 2.0};
static const float default_controller[4] = {0.0, 0.0, 0.0, 0.0};

static const float default_automaton[3] = {0.0, 0.0, 0.0};

char str[400] = {0};
char *token;

const int iTime = 0;
const int iCon  = 1;
const int iStat = 2;
const int iOut  = 3;

// Function declaration
void init();
void simulate(float t);
void traslate (float *var, char *token);
void *read_state (void *arg);

int main (void) {
	float t0;

    float T     = 0.1;      //Sample period
    float Td    = 0.015;    //Sleep between read and write

    init();
	pthread_t thread;
	pthread_create(&thread, NULL, read_state, NULL);

	printf("config: %g\n", config);
	fflush(stdout);
	delay(100);

	printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
	fflush(stdout);
	delay(100);

	printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3]);
	fflush(stdout);
	delay(100);

	t0 = millis();

	while (config) {

        switch((int) config) {
            case 1: //En espera

                t0 = millis();
                delay(Td * 1000);
                break;

            case 2: //Play

                // Se ejecuta la simulacion
                simulate((millis() - t0)/1e3);

                t0 = millis();
                delay(Td * 1000);
                break;

            case 3: // Pause

                t0 = millis();
                delay(Td * 1000);
                break;

            case 4:// Reset

                init();
                delay(100);
                config = 1;

                sendState = 1;
                t0 = millis();

//                printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
//                fflush(stdout);
//                delay(50);
//
//                printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1],controller[2], controller[3]);
//                fflush(stdout);
//                delay(50);
//
//                config = 1;
//                printf("config: %g\n", config);
//                fflush(stdout);
//                delay(50);

                break;
        }; //switch

        if (sendState) {
            printf("config: %g\n", config);
            fflush(stdout);
            delay(50);

            printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
            fflush(stdout);
            delay(50);

            printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3]);
            fflush(stdout);
            delay(50);

            sendState = 0;
        }

        printf("evolution: [%0.3f, %0.3f, %0.3f, %0.3f]\n", evolution[0], evolution[1], evolution[2], evolution[3]);
        fflush(stdout);

        delay ((T - Td) * 1000);
	}

    init();

	printf("config: %g\n", config);
	fflush(stdout);
	delay(100);

	printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
	fflush(stdout);
	delay(100);

	printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3]);
	fflush(stdout);
	delay(100);

	printf("evolution: [%0.3f, %0.3f, %0.3f, %0.3f]\n", evolution[0], evolution[1], evolution[2], evolution[3]);
	fflush(stdout);

	return 0;
}

/*
* Initialize function
*/
void init(void){

    memcpy(evolution, default_evolution, sizeof(default_evolution));
    memcpy(simulation, default_simulation, sizeof(default_simulation));
    memcpy(controller, default_controller, sizeof(default_controller));

    memcpy(automaton, default_controller, sizeof(default_automaton));

}

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
    // All values in simulation[] and controller[] must be positive
    // and max >= min

    float simulationaux[4];
    float controlleraux[4];
    int i;

    while(config) {

        read(0, &str, 40);
        token = strtok(str, ":");

        if (strcmp("config", token) == 0)
        {
            token = strtok(NULL, "");
            traslate (&config, token);

            printf("config: %g\n", config);
            fflush(stdout);

            delay(10);

            printf("config: %g\n", config);
            fflush(stdout);
        }
        else if (strcmp("simulation", token) == 0)
        {
            token = strtok(NULL, "");
            traslate (&simulationaux[0], token);

            for (i=0;i<4;i++)
            {
                // Ensure positive value for "simulation[*]"
                if (simulationaux[i]>=0.0)
                    simulation[i]=simulationaux[i];
            }

            printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
            fflush(stdout);
        }
        else if (strcmp("controller", token) == 0)
        {
            token = strtok(NULL, "");
            traslate (&controlleraux[0], token);

            // If single threshold, apply same value to min and max
            if (controlleraux[0] == 0.0)
            {
                controlleraux[2] = controlleraux[1];
                controlleraux[3] = controlleraux[1];
            }

            // Ensure min <= max
            if (controlleraux[2] <= controlleraux[3])
            {
                for (i=0;i<4;i++)
                {
                    // Ensure positive value for "controller[*]"
                    if (controlleraux[i]>=0.0)
                        controller[i]=controlleraux[i];
                }
            }

            printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3]);
            fflush(stdout);
        }
        else if (strcmp("reset", token) == 0)
        {
            init();
            printf("simulation: [%g, %g, %g, %g]\n", simulation[0], simulation[1], simulation[2], simulation[3]);
            printf("controller: [%0.2f, %0.2f, %0.2f, %0.2f]\n", controller[0], controller[1], controller[2], controller[3]);
            fflush(stdout);
        }
        else if (strcmp("connect", token) == 0)
        {
            sendState = 1;
        }

        sleep(0.1);

        memset(str, 0, sizeof str);
    }

    return 0;
}

/*
 * Simulate function
 */
void simulate (float t) {
    float dt = t;

    // All values in simulation[] and controller[] must be positive
    // and max >= min

    // Execute automaton
    while (dt > 0.0) {
        // Calculate tank level
        switch((int) automaton[0]) {
            case 0 : // empty
            {
                float t_guard; // time required for time to reach delay

                // Calculate t_guard
                // Check if time is already above delay
                if (automaton[2] <= simulation[3])
                    t_guard = simulation[3] - automaton[2];
                else
                    t_guard = 0.0;

                // Evolve h and t
                automaton[1] = automaton[1]; // h'=0
                if (t_guard > dt)
                {
                    automaton[2] = automaton[2] + dt; // t'=1
                    dt = 0.0;
                }
                else
                {
                    automaton[0] = 1.0; // on
                    automaton[2] = automaton[2] + t_guard; // t'=1
                    dt -= t_guard;
                }
                break;
            }

            case 1: // on
            {
                float t_guard; // time required for level to reach max

                // Calculate t_guard
                if (simulation[1] > 0.0)
                {
                    // Check if level is already above max
                    if (automaton[1] <= controller[3])
                        t_guard = (controller[3]-automaton[1]) / simulation[1];
                    else
                        t_guard = 0.0;
                }
                else
                    t_guard = -1.0;

                // Evolve h and t
                if (t_guard < 0.0 || t_guard > dt)
                {
                    automaton[1] = automaton[1] + (dt * simulation[1]); // h'=v_up
                    automaton[2] = automaton[2] + dt; // t'=1
                    dt = 0.0;
                }
                else
                {
                    automaton[0] = 2.0; // woff
                    automaton[1] = automaton[1] + (t_guard * simulation[1]); // h'=v_up
                    automaton[2] = 0.0; // t'=1 => t:=0
                    dt -= t_guard;
                }
                break;
            }

            case 2: // woff
            {
                float t_guard; // time required for time to reach delay

                // Calculate t_guard
                // Check if time is already above delay
                if (automaton[2] <= simulation[3])
                    t_guard = simulation[3] - automaton[2];
                else
                    t_guard = 0.0;

                // Evolve h and t
                if (t_guard > dt)
                {
                    automaton[1] = automaton[1] + (dt * simulation[1]); // h'=v_up
                    automaton[2] = automaton[2] + dt; // t'=1
                    dt = 0.0;
                }
                else
                {
                    automaton[0] = 3.0; // off
                    automaton[1] = automaton[1] + (t_guard * simulation[1]); // h'=v_up
                    automaton[2] = automaton[2] + t_guard; // t'=1
                    dt -= t_guard;
                }
                break;
            }

            case 3: // off
            {
                float t_guard; // time required for level to reach max

                // Calculate t_guard
                if (simulation[2] > 0.0)
                {
                    // Check if level is already below min
                    if (automaton[1] >= controller[2])
                        t_guard = (automaton[1]-controller[2]) / simulation[2];
                    else
                        t_guard = 0.0;
                }
                else
                    t_guard = -1.0;

                // Evolve h and t
                if (t_guard < 0.0 || t_guard > dt)
                {
                    automaton[1] = automaton[1] - (dt * simulation[2]); // h'=v_down
                    // Ensure values in automaton[] are positive
                    if (automaton[1] < 0.0)
                        automaton[1] = 0.0;
                    automaton[2] = automaton[2] + dt; // t'=1
                    dt = 0.0;
                }
                else
                {
                    automaton[0] = 4.0; // won
                    automaton[1] = automaton[1] - (t_guard * simulation[2]); // h'=v_down
                    automaton[2] = 0.0; // t'=1 => t:=0
                    dt -= t_guard;
                }
                break;
            }

            case 4: // won
            {
                float t_guard; // time required for time to reach delay
                float t_empty; // time required for tank to be empty

                // Calculate t_guard
                // Check if time is already above delay
                if (automaton[2] <= simulation[3])
                    t_guard = simulation[3] - automaton[2];
                else
                    t_guard = 0.0;

                // Calculate t_empty
                if (simulation[2] > 0.0)
                {
                    // Check if level is already 0
                    if (automaton[1] >= 0.0)
                        t_empty = automaton[1] / simulation[2];
                    else
                        t_empty = 0.0;
                }
                else
                    t_empty = -1.0;

                // Evolve h and t
                if (t_empty >= 0.0 && t_empty < t_guard && t_empty < dt)
                {
                    automaton[0] = 0.0; // empty
                    automaton[1] = 0.0; // h'=v_down => h=0
                    automaton[2] = automaton[2] + t_empty; // t'=1
                    dt -= t_empty;
                }
                else if (t_guard > dt)
                {
                    automaton[1] = automaton[1] - (dt * simulation[2]); // h'=v_down
                    // Ensure values in automaton[] are positive
                    if (automaton[1] < 0.0)
                        automaton[1] = 0.0;
                    automaton[2] = automaton[2] + dt; // t'=1
                    dt = 0.0;
                }
                else
                {
                    automaton[0] = 1.0; // on
                    automaton[1] = automaton[1] - (t_guard * simulation[2]); // h'=v_down
                    automaton[2] = automaton[2] + t_guard; // t'=1
                    dt -= t_guard;
                }
                break;
            }

            default:
            {
                dt = 0;
                break;
            }
        }
    }

    // Update evolution
    evolution[iTime] += t;
    switch((int) automaton[0]) {
        case 0 : // empty
            evolution[iCon] = 1.0;
            break;
        case 1 : // on
            evolution[iCon] = 1.0;
            break;
        case 2 : // woff
            evolution[iCon] = 0.0;
            break;
        case 3 : // off
            evolution[iCon] = 0.0;
            break;
        case 4 : // won
            evolution[iCon] = 1.0;
            break;
        default : // unknown
            break;
    }

    evolution[iStat] = automaton[0];
    evolution[iOut] = automaton[1];
}
