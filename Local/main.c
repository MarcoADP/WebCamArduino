//#define F_CPU 16000000

#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>

#define BAUD 9600
//#define MYUBRR F_CPU/16/BAUD-1
#include <util/setbaud.h>

#define led          PD7

#define set_bit(y,bit) (y|=(1<<bit)) //coloca em 1 o bit x da variável Y
#define clr_bit(y,bit) (y&=~(1<<bit)) //coloca em 0 o bit x da variável Y
#define cpl_bit(y,bit) (y^=(1<<bit)) //troca o estado lógico do bit x da variável Y
#define tst_bit(y,bit) (y&(1<<bit)) //retorna 0 ou 1 conforme leitura do bit 

#define DISPARO PB1

unsigned int Inicio_Sinal, Distancia;

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

//----------------------------------------------
//             CONFIGURAÇÃO SENSOR
//----------------------------------------------

ISR(TIMER1_CAPT_vect)
{
  cpl_bit(TCCR1B, ICES1);
  if(!tst_bit(TCCR1B,ICES1))
    Inicio_Sinal = ICR1;
  else
    Distancia = (ICR1 - Inicio_Sinal)/116;
}

int main() {   
  uart_init();
  DDRB = 0b00000010;
  PORTB = 0b11111101;
  DDRD |= 0b10000000;
  Distancia = 1000;

  TCCR1B = (1<<ICES1) | (1<<CS11);
  TIMSK1 = 1<<ICIE1;
  sei();

  while(1)
  {
    set_bit(PORTB,DISPARO);
    _delay_us(10);
    clr_bit(PORTB,DISPARO);
    
    if(Distancia < 400){
      set_bit(PORTD, led);
      serial_send("TP\n");
      _delay_ms(3000);
    } else {
      clr_bit(PORTD, led);
      serial_send("OBJETO NAO DETECTADO...\n");
    }
    _delay_ms(50);
  }
  return 0;  
}