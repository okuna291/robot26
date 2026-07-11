// arduino_sketch.ino
// Talks to the computer over serial in BOTH directions at the same time:
//   SEND    : read A0, map to 0-255, send a reading every 100 ms.
//   RECEIVE : read a number coming back from the computer and set the LED on pin 11.
//
// The trick for reliable two-way serial is to NEVER block:
//   - We read incoming data one character at a time (no Serial.parseInt).
//   - We send on a millis() timer (no delay()).
// This way the "in" and "out" directions never get in each other's way.

const int sensorPin = A0;   // analog input (e.g. a potentiometer)
const int ledPin = 11;      // PWM pin (~) for the LED

String incoming = "";                    // collects characters until we see a newline
unsigned long lastSend = 0;              // remembers when we last sent a reading
const unsigned long sendEvery = 100;     // send a reading every 100 ms

void setup() {
  Serial.begin(9600);        // must match the baudRate in server.js
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // ---- RECEIVE (runs every loop, never blocks) ----
  while (Serial.available() > 0) {
    char c = Serial.read();            // read ONE character
    if (c == '\n') {                   // newline means a full number has arrived
      int value = incoming.toInt();    // turn the collected text into a number
      value = constrain(value, 0, 255);// keep it inside 0-255
      analogWrite(ledPin, value);      // set the LED brightness
      incoming = "";                   // clear the buffer for the next number
    } else if (c != '\r') {            // ignore carriage returns
      incoming += c;                   // otherwise add the character to our buffer
    }
  }

  // ---- SEND (only every 100 ms, using millis() instead of delay) ----
  if (millis() - lastSend >= sendEvery) {
    lastSend = millis();
    int raw = analogRead(sensorPin);          // 0-1023
    int out = map(raw, 0, 1023, 0, 255);      // squeeze down to 0-255
    Serial.println(out);                      // send the number + a newline
  }
}

// NOTE ABOUT PIN 11:
// Pin 11 IS a true PWM pin on the Arduino Uno (look for the "~" next to it), so
// analogWrite() smoothly dims the LED across the full 0-255 range.
// Wire the LED from pin 11 through a resistor (~220 ohm) to ground.
//
// IMPORTANT: Do NOT add any other Serial.print() lines to this sketch.
// The computer expects ONLY the number, so extra text would confuse it.
