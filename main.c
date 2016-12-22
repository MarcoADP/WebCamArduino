//#define F_CPU 16000000

#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>

#define BAUD 9600
//#define MYUBRR F_CPU/16/BAUD-1
#include <util/setbaud.h>

#define pinoSensor   PD7
#define led          PB0

#define clr_bit(reg, idx)(reg &= ~(_BV(idx)))
#define set_bit(reg, idx)(reg |= _BV(idx))
#define tst_bit(reg, bit) (reg&(1<<bit)) 

//----------------------------------------------
//             COMUNICAÇÃO SERIAL
//----------------------------------------------

void uart_init(void) {
  UBRR0H = UBRRH_VALUE;
  UBRR0L = UBRRL_VALUE;

#if USE_2X
  UCSR0A |= _BV(U2X0);
#else
  UCSR0A &= ~(_BV(U2X0));
#endif

  UCSR0C = _BV(UCSZ01) | _BV(UCSZ00); /* 8-bit data */
  UCSR0B = _BV(RXEN0) | _BV(TXEN0);   /* Enable RX and TX */
}

void uart_putchar(char data) {
  // Wait for empty transmit buffer
  loop_until_bit_is_set(UCSR0A, UDRE0);
  // Put data into buffer, sends the data
  UDR0 = data;
}

char uart_getchar(void) {
  loop_until_bit_is_set(UCSR0A, RXC0); /* Wait until data exists. */
  return UDR0;
}

void serial_send(char *msg) {
  for (char *elem = msg; *elem != '\0'; elem++) {
    uart_putchar(*elem);
  }
}

char* serial_readline() {
  char *line = (char*) malloc(96);
  uint8_t i = 0;

  line[i] = uart_getchar();
  while (line[i] != '\n') {
    line[++i] = uart_getchar();
  }
  line[i] = '\0';

  return line;
}


int main() {   
  uart_init();
  DDRB  |= 0b00000001;
  PORTD |= 0b10000000;

  while(1)
  {
    if(!tst_bit(PIND, pinoSensor)){
      set_bit(PORTB, led);
      serial_send("TP\n");
      _delay_ms(3000);
    } else {
      clr_bit(PORTB, led);
      serial_send("OBJETO NAO DETECTADO...\n");
    }
  }
  return 0;  
}


