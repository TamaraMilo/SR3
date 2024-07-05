import './App.css';
import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import temperatureImg from './Temperature-PNG-Image.png'; 
import {ReactComponent as Icon} from './thermometer-temperature-svgrepo-com.svg';
import {ReactComponent as PressureImage} from './gauge-indicator-svgrepo-com.svg';
import {ReactComponent as Weather} from './weather-cloud-svgrepo-com.svg';


const ENDPOINT = "ws://localhost:8765";



function App() {

  const [temperature, setTemperature] = useState(0.0)
  const [pressure, setPressure] = useState(0.0)
  const [prediction, setPrediction] = useState("")

  const {
    lastMessage,
    readyState
  } = useWebSocket('ws://localhost:8765', {

    onOpen: () => console.log('WebSocket connection established.'),
    onClose: () => console.log('WebSocket connection closed.'),
    onError: (event) => console.error('WebSocket error: ', event),
    onMessage: (event) => onMessage(event.data)
  });
 
  const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsText(blob);
  });

  function onMessage(message) {
     convertBlobToBase64(message).then((value) => {
      const jsonObject = JSON.parse(value);
      setPrediction(jsonObject.prediction)
      setTemperature(jsonObject.temperature)
      setPressure(jsonObject.pressure)
    });
    
  }

  return (
    <div className="App">
      <h1 className='naslov'>Sveprisutno racunarstvo projekat</h1>

      <div className='prediction'>
      <Weather className='weatherIcon' width="150px" height="120px"/>
        <h3>Weather now is: {prediction}</h3>
      </div>

      <div className='temperatureAndPressure'>
        <div className='temperature'>
          
        <Icon className='home__icon' width="150px" height="120px"/>
        <h3>Temperature now is: {temperature} ˚C</h3>
        </div>
        
        <div className='pressure' width= "500px">
        <PressureImage className='home__icon' width="150px" height="120px"/>

          <h3>Pressure now is: {pressure} Pa</h3>
        </div>
      </div>

    </div>
  );
}

export default App;
