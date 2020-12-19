/*
 * gertboard.c:
 *	Access routines for the SPI devices on the Gertboard
 *	Copyright (c) 2012 Gordon Henderson
 *
 *	The Gertboard has:
 *
 *		An MCP3002 dual-channel A to D convertor connected
 *		to the SPI bus, selected by chip-select A, and:
 *
 *		An MCP4802 dual-channel D to A convertor connected
 *		to the SPI bus, selected via chip-select B.
 *
 ***********************************************************************
 * This file is part of wiringPi:
 *	https://projects.drogon.net/raspberry-pi/wiringpi/
 *
 *    wiringPi is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    wiringPi is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public
 *    License along with wiringPi.
 *    If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************
 */


#include <stdio.h>
#include <stdint.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/spi/spidev.h>

#include <wiringPi.h>
#include <wiringPiSPI.h>

#include "gertboardISA.h"

// The A-D convertor won't run at more than 1MHz @ 3.3v

#define	SPI_ADC_SPEED	1000000
#define	SPI_DAC_SPEED	1000000
#define	SPI_A2D		      0
#define	SPI_D2A		      1


/*
 * gertboardAnalogWrite:
 *	Write an 8-bit data value to the MCP4802 Analog to digital
 *	convertor on the Gertboard.
 *********************************************************************************
 */

void gertboardAnalogWrite2 (const int chan, const int value)
{
  uint8_t spiData [2] ;
  uint8_t chanBits, dataBits ;

  if (chan == 0)
    chanBits = 0x10 ; //30
  else
    chanBits = 0x90 ; //B0

  chanBits |= ((value >> 6) & 0x0F) ;
  dataBits  = ((value << 2) & 0xFC) ;

  //chanBits |= ((value >> 4) & 0x0F) ;
  //dataBits  = ((value << 4) & 0xF0) ;

  spiData [0] = chanBits ;
  spiData [1] = dataBits ;

//  printf("Convierto %x %x\n",chanBits,dataBits);
  wiringPiSPIDataRW (SPI_D2A, spiData, 2) ;
}


/*
 * gertboardAnalogRead:
 *	Return the analog value of the given channel (0/1).
 *	The A/D is a 10-bit device
 *********************************************************************************
 */

int gertboardAnalogRead2 (const int chan)
{
  uint8_t spiData [3] ;

  uint8_t chanBits ;

  chanBits = 8 + (chan & 3);
  spiData [0] = 1 ;
  spiData [1] = chanBits ;
  spiData [2] = 0 ;

  wiringPiSPIDataRW (SPI_A2D, spiData, 3) ;

  return ((spiData[1] & 3) << 8) + spiData[2];
}


/*
 * gertboardSPISetup:
 *	Initialise the SPI bus, etc.
 *********************************************************************************
 */

int gertboardSPISetup2 (void)
{
  if (wiringPiSPISetup (SPI_A2D, SPI_ADC_SPEED) < 0)
    return -1 ;

  if (wiringPiSPISetup (SPI_D2A, SPI_DAC_SPEED) < 0)
    return -1 ;

  return 0 ;
}


/*
 * New wiringPi node extension methods.
 *********************************************************************************
 */

static int myAnalogRead2 (struct wiringPiNodeStruct *node, const int chan)
{
  return gertboardAnalogRead2 (chan - node->pinBase) ;
}

static void myAnalogWrite2 (struct wiringPiNodeStruct *node, const int chan, const int value)
{
  gertboardAnalogWrite2 (chan - node->pinBase, value) ;
}


/*
 * gertboardAnalogSetup:
 *	Create a new wiringPi device node for the analog devices on the
 *	Gertboard. We create one node with 2 pins - each pin being read
 *	and write - although the operations actually go to different
 *	hardware devices.
 *********************************************************************************
 */

int gertboardAnalogSetup2 (const int pinBase)
{
  struct wiringPiNodeStruct *node ;
  int    x ;

  if (( x = gertboardSPISetup2 ()) != 0)
    return  x;

  node = wiringPiNewNode (pinBase, 2) ;
  node->analogRead  = myAnalogRead2 ;
  node->analogWrite = myAnalogWrite2 ;

  return 0 ;
}
