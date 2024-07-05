FROM python:3.12.4 
ADD app.py .
RUN pip install tensorflow paho-mqtt numpy influxdb_client asyncio
CMD [“python”, “./app.py”] 
