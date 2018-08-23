int counter = 0;

void setup() {
	Serial.begin(9600);
}

void loop() {
	Serial.printlnf("testing %d", ++counter);
	delay(1000);
}