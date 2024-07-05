import json
import paho.mqtt.client as mqtt
import numpy as np
from datetime import datetime
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS
import tensorflow as tf
import asyncio
import websockets

interpreter = tf.lite.Interpreter(model_path="../model/env_model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

bucket = "sr3"
org = "elfak"
token = "lUV_75RLLoirce1qs8RedkdZIkUYUzDQV7hAdEab-7TZkmAKdKrzGfEWQDvbi8UIBDgI8XlOJJkbFsNB-x0VYg=="
url = "http://localhost:8086/"
wsurl = "ws://localhost:8765/"

influx_client = influxdb_client.InfluxDBClient(
    url=url,
    token=token,
    org=org
)

write_api = influx_client.write_api(write_options=SYNCHRONOUS)

def saveDataInfluxDB(data):
    p = (influxdb_client.Point("measurement")
         .field("temperature", np.float32(data['temperature']))
         .field("pressure", np.float32(data['pressure']))
         .time(datetime.now())
         )

    write_api.write(bucket=bucket, record=p)

def predict(data):
    input_data = np.array([[data['temperature'], data['pressure']]], dtype=np.float32)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    prediction = np.float32(output_data[0][0])
    return "Bice lepo vreme" if prediction > 0.5 else "Bice tesko vreme"


async def on_message(client, userdata, message):
    my_new_string_value = message.payload.decode("utf-8").replace("'", '"')
    data = json.loads(my_new_string_value)
    saveDataInfluxDB(data)
    prediction = predict(data)

    emit_data = {
        "prediction": prediction,
        "temperature": float(data['temperature']),
        "pressure": float(data['pressure'])
    }
    async with websockets.connect(wsurl) as websocket:
        await websocket.send(json.dumps(emit_data))


def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("serial-reader/data")

def mqtt_on_message(client, userdata, message):
    asyncio.run(on_message(client, userdata, message))

# Start MQTT loop
client = mqtt.Client(client_id="user3")
client.on_connect = on_connect

client.on_message = mqtt_on_message
client.username_pw_set(username="user3", password="user")
client.connect("127.0.0.1", 1883)
client.loop_forever()
