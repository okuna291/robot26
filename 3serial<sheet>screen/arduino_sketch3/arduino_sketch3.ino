// arduino_sketch.ino
// Reads THREE sensors and drives THREE LEDs, talking both ways over serial at once.
//   SEND    : read A0, A1, A2, map each to 0-255, send "r,g,b" every 100 ms.
//   RECEIVE : read "r,g,b" back from the computer and set LEDs on pins 11, 10, 9.
//
// Both directions are non-blocking (no delay(), no parseInt) so they never fight.

const int sensorPins[3] = { A0, A1, A2 };   // three analog inputs
const int ledPins[3]    = { 11, 10, 9 };    // three PWM pins (~) for the LEDs

String incoming = "";                    // collects characters until a newline
unsigned long lastSend = 0;              // when we last sent a reading
const unsigned long sendEvery = 100;     // send every 100 ms

void setup() {
  Serial.begin(9600);                    // must match server.js baudRate
  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
  }
}

void loop() {
  // ---- RECEIVE (runs every loop, never blocks) ----
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {                     // a full "r,g,b" line has arrived
      applyValues(incoming);             // parse it and set the LEDs
      incoming = "";                     // clear for the next line
    } else if (c != '\r') {
      incoming += c;                     // build up the line
    }
  }

  // ---- SEND (every 100 ms using millis(), not delay) ----
  if (millis() - lastSend >= sendEvery) {
    lastSend = millis();
    for (int i = 0; i < 3; i++) {
      int raw = analogRead(sensorPins[i]);      // 0-1023
      int out = map(raw, 0, 1023, 0, 255);      // 0-255
      Serial.print(out);
      if (i < 2) Serial.print(',');             // commas between values
    }
    Serial.println();                           // newline ends the line
  }
}

// Take a line like "123,45,200", split it into three numbers,
// and set the brightness of the three LEDs.
void applyValues(String line) {
  int c1 = line.indexOf(',');                   // position of first comma
  int c2 = line.indexOf(',', c1 + 1);           // position of second comma
  if (c1 == -1 || c2 == -1) return;             // not three values, ignore

  int r = line.substring(0, c1).toInt();
  int g = line.substring(c1 + 1, c2).toInt();
  int b = line.substring(c2 + 1).toInt();

  analogWrite(ledPins[0], constrain(r, 0, 255));
  analogWrite(ledPins[1], constrain(g, 0, 255));
  analogWrite(ledPins[2], constrain(b, 0, 255));
}

// NOTE: Pins 9, 10, and 11 are all real PWM pins ("~") on the Arduino Uno,
// so analogWrite() dims each LED smoothly across 0-255.
// Wire each LED from its pin through a ~220 ohm resistor to ground.
// Do NOT add extra Serial.print() lines: the computer expects ONLY "r,g,b".
