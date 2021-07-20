#
# Makefile:
#	wiringPi - Wiring Compatable library for the Raspberry Pi
#	https://projects.drogon.net/wiring-pi
#
#	Copyright (c) 2012 Gordon Henderson
#################################################################################
# This file is part of wiringPi:
#	Wiring Compatable library for the Raspberry Pi
#
#    wiringPi is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    wiringPi is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with wiringPi.  If not, see <http://www.gnu.org/licenses/>.
#################################################################################


#DEBUG	= -g -O0
DEBUG	= -O3
CC	= gcc
INCLUDE	= -I/usr/local/include
CFLAGS	= $(DEBUG) -Wall $(INCLUDE) -Winline -pipe

LDFLAGS	= -L/usr/local/lib
LDLIBS    = -lpthread -lm

# Should not alter anything below this line
###############################################################################

SRC	=	$(wildcard *.c)

OBJ	=	$(SRC:.c=.o)

BINS	=	$(SRC:.c=)

all:	
#	@cat README.TXT
	@echo "    $(BINS)" | fmt
	@echo ""

really-all:	$(BINS)

c_controller:	$(OBJ)
	@echo [link]
	@$(CC) -o $@ i2c_test.o $(LDFLAGS) $(LDLIBS)

circuit_practice_controller:	circuit_practice_controller.o gertboardISA.o
	@echo [link]
	@$(CC) -o $@  gertboardISA.o circuit_practice_controller.o $(LDFLAGS) $(LDLIBS)

circuit_practice_controller_10:	circuit_practice_controller_10.o gertboardISA.o
	@echo [link]
	@$(CC) -o $@  gertboardISA.o circuit_practice_controller_10.o $(LDFLAGS) $(LDLIBS)

circuitos:	circuitos.o gertboardISA.o
	@echo [link]
	@$(CC) -o $@  gertboardISA.o circuitos.o $(LDFLAGS) $(LDLIBS)

.c.o:
	@echo [CC] $<
	@$(CC) -c $(CFLAGS) $< -o $@

clean:
	@echo "[Clean]"
	@rm -f $(OBJ) *~ core tags $(BINS)

tags:	@$(SRC)
	@echo [ctags]
	@ctags $(SRC)

depend:
	@makedepend -Y $(SRC)

# DO NOT DELETE
