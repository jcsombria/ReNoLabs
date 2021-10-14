const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'lab',
    schema: [
      {
        measurement: 'response_times',
        fields: {
          value: Influx.FieldType.STRING,
        },
        tags: [
          'host'
        ]
      }
    ]
  })