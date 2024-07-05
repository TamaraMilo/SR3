const SerialPort = require('serialport');
const mqtt = require('mqtt');

const parsers = SerialPort.parsers;
const parser = new parsers.Readline();

const qos = 2;
const mqttAddress = 'tcp://localhost:1883'
const clientId = 'serial-reader'
const username = 'serial-reader'
const password = 'serial'
const topic = 'serial-reader/data'

const mqttClient = mqtt.connect(mqttAddress, {
    clientId,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000
})

const port = new SerialPort('/dev/cu.usbmodem1101', {
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,    
    flowControl: false
});

port.pipe(parser);

port.on('open', function () {
    port.set({ dtr: true, rts: true });
    console.log("opened")
})

port.on('data', function(data){
    const data2 = data.toString();
    console.log(data2);

    const values = data2.split(", ").map(val => parseFloat(val.trim()));

    const procPressure = values[1] * 1000
    const jsonObject = {
        temperature: values[0],
        pressure: procPressure,
    }
    console.log(jsonObject)
    mqttClient.publish(topic, JSON.stringify(jsonObject), { qos }, error => {
        if (error) {
            console.error('ERROR: ', error)
        }
    })
});
