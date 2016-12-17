#define F_CPU 16000000

#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>

#define BAUD 9600
//#define MYUBRR F_CPU/16/BAUD-1
#include <util/setbaud.h>

#define clear_bit(reg, idx)(reg &= ~(_BV(idx)))
#define set_bit(reg, idx)(reg |= _BV(idx))

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

int uart_putchar(char data) {
  // Wait for empty transmit buffer
  loop_until_bit_is_set(UCSR0A, UDRE0);
  // Put data into buffer, sends the data
  UDR0 = data;
  return 0;
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
  char *line = malloc(96);
  uint8_t i = 0;

  line[i] = uart_getchar();
  while (line[i] != '\n') {
    line[++i] = uart_getchar();
  }
  line[i] = '\0';

  return line;
}

/*void uart_putchar(char c, FILE *stream) {
  if (c == '\n') {
    uart_putchar('\r', stream);
  }
  loop_until_bit_is_set(UCSR0A, UDRE0);
  UDR0 = c;
}

char uart_getchar(FILE *stream) {
  loop_until_bit_is_set(UCSR0A, RXC0);
  return UDR0;
}*/


int main() {  
  /*FILE uart_output = FDEV_SETUP_STREAM(uart_putchar, NULL, _FDEV_SETUP_WRITE);
  FILE uart_input = FDEV_SETUP_STREAM(NULL, uart_getchar, _FDEV_SETUP_READ);

  uart_init();
  stdout = &uart_output;
  stdin  = &uart_input;

  char input;

  while(1) {
    puts("Hello world!");
    input = getchar();
    printf("You wrote %c\n", input);
  }*/

  return 0;
  
}


