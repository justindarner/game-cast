#include "Serial2/Serial2.h"

// constants
int LATCH = D3;
int CLOCK = D4;
int DATA1 = D5;
int BOARD_LED = D7;


// globals
int readCount = 0;
int lastButtons = 0;
int buttons = 0;
int lastPrint = 0;

// used for debounce
unsigned long lastDebounceTime = 0;  // the last time the output pin was toggled
unsigned long debounceDelay = 1;    // the debounce time; increase if the output flickers

// to hold the data to transmit
byte data[3];


/**
* The Setup
*/
void setup() {
    Serial.begin(115200);

    pinMode(LATCH, INPUT);
    pinMode(CLOCK, INPUT);
    pinMode(DATA1, INPUT);

    pinMode(BOARD_LED, OUTPUT);
}

/**
* Send the data -
*   - blink the led
*   - send tlv over serial
*/
void send() {

    if (lastButtons != buttons) {
        lastDebounceTime = millis();
    }

    // debounce to filter out erroneous noise
    if ((millis() - lastDebounceTime) > debounceDelay) {
        if (lastPrint != buttons) {
            digitalWrite(BOARD_LED, buttons < 255 ? HIGH : LOW);
            data[0] = 0; // Tag=0: standard message that the buttons flags are in the value
            data[1] = 1; // 1 byte
            data[2] = buttons & 0xff;
            Serial.write(data, 3); // 3 bytes total
            lastPrint = buttons;
        }
  }
}

/**
* Return once the falling edge of the pin is detected
*/
void waitFallingEdge(int pin) {
    bool last = false;
    bool current = false;
    bool fallingEdge = false;

    while (!fallingEdge) {
        last = current;
        current = pinReadFast(pin) == HIGH;
        fallingEdge = last && !current;
    }
}

/**
* Return once the raising edge of the pin is detected
*/
void waitRaisingEdge(int pin) {
    bool last = false;
    bool current = false;
    bool raisingEdge = false;

    while (!raisingEdge) {
        last = current;
        current = pinReadFast(pin) == HIGH;
        raisingEdge = !last && current;
    }
}



void loop() {

   // wait for the signal that the controller is asking for button presses
    waitRaisingEdge(LATCH);

    for (; readCount < 8; readCount += 1) {
        // wait for it, stay on target
        waitFallingEdge(CLOCK);

        // set the bit if data line is high
        if (pinReadFast(DATA1) == HIGH) {
            buttons |= 1UL << readCount;
        }
    }

    // send the results
    send();

    // reset values for next loop
    lastButtons = buttons;
    readCount = 0;
    buttons = 0;
}
