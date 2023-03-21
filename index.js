var battery_Characteristic, acceleromter_Characteristic, magnetometer_Characteristic, gyroscope_Characteristic;
const sensordata = [];

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');

startBtn.addEventListener("click", onStartButtonClick);
stopBtn.addEventListener("click", onStopButtonClick);

function log(text) {
  // document.querySelector("#log").value += text + "\n"
}

async function onStartButtonClick() {
  // add new
  let serviceUuid = "00000000-0001-11e1-9ab4-0002a5d5c51b";
  let batteryUuid = "00020000-0001-11e1-ac36-0002a5d5c51b";
  let acceleromterUuid = "00800000-0001-11e1-ac36-0002a5d5c51b";
  // let acceleromter_eventUuid = "00000400-0001-11e1-ac36-0002a5d5c51b";
  let magnetometerUuid = "00200000-0001-11e1-ac36-0002a5d5c51b";
  let gyroscopeUuid = "00400000-0001-11e1-ac36-0002a5d5c51b";

  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // add newDD
      optionalServices: [serviceUuid, batteryUuid, acceleromterUuid, magnetometerUuid, gyroscopeUuid],
      // optionalServices: [serviceUuid, magnetometerUuid],
      acceptAllDevices: true
    });

    log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    log('Getting Characteristic...');
    // add new
    battery_Characteristic = await service.getCharacteristic(batteryUuid);
    acceleromter_Characteristic = await service.getCharacteristic(acceleromterUuid);
    magnetometer_Characteristic = await service.getCharacteristic(magnetometerUuid);
    gyroscope_Characteristic = await service.getCharacteristic(gyroscopeUuid);
    // acceleromter_event_Characteristic = await service.getCharacteristic(acceleromter_eventUuid);

    // add new
    await battery_Characteristic.startNotifications();
    await acceleromter_Characteristic.startNotifications();
    await magnetometer_Characteristic.startNotifications();
    await gyroscope_Characteristic.startNotifications();
    // await acceleromter_event_Characteristic.startNotifications();

    log('> Notifications started');
    // add new
    battery_Characteristic.addEventListener('characteristicvaluechanged',
      battery_func);
    acceleromter_Characteristic.addEventListener('characteristicvaluechanged',
      acceleromter_func);
    magnetometer_Characteristic.addEventListener('characteristicvaluechanged',
      magnetometer_func);
    gyroscope_Characteristic.addEventListener('characteristicvaluechanged',
      gyroscopeUuid);
    // acceleromter_event_Characteristic.addEventListener('characteristicvaluechanged',
    // acceleromter_event_func);

  } catch (error) {
    log('Argh! ' + error);
  }
}

async function onStopButtonClick() {

  try {
    await battery_Characteristic.stopNotifications();
    await acceleromter_Characteristic.stopNotifications();
    await magnetometer_Characteristic.stopNotifications();
    await gyroscope_Characteristic.stopNotifications();
    battery_Characteristic.removeEventListener('characteristicvaluechanged',
      battery_func);
    acceleromter_Characteristic.removeEventListener('characteristicvaluechanged',
      acceleromter_func);
    magnetometer_Characteristic.removeEventListener('characteristicvaluechanged',
      magnetometer_func);
    gyroscope_Characteristic.removeEventListener('characteristicvaluechanged',
      gyroscope_func);
    log('> Notifications stopped');

    const csv = sensordata.map(row => row.join(',')).join('\n');
    document.querySelector("#log").innerHTML = '';
    log(csv);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    log('Argh! ' + error);
  }
}

function bytes2int16(bytes) {
  var view = new DataView(new ArrayBuffer(2));
  view.setUint8(0, bytes[0]);
  view.setUint8(1, bytes[1]);
  return view.getInt16(0, true); // true indicates little-endian byte order
}
// function bytes2int16(high, low) {
//   return (low << 8) | high
// }
function bytes4int32(one, two, three, four) {
  return (((four << 8) | three) << 16) | ((two << 8) | one)
}

// 00020000-0001-11e1-ac36-0002a5d5c51b
function battery_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));


  let Timestamp = bytes2int16([bytes[0], bytes[1]])
  let percentage = bytes2int16([bytes[2], bytes[3]]) / 10
  let voltage = bytes2int16([bytes[4], bytes[5]]) / 1000
  let current = bytes2int16([bytes[6], bytes[7]]) / 10
  let status = parseInt(bytes[8])

  if (Timestamp)
    if (status == 2) { percentage = 0; current = 0 }

  document.getElementById("batVoltage").innerHTML = voltage;
  document.getElementById("batCurrent").innerHTML = current;
  document.getElementById("batStatus").innerHTML = status;

  let output = ["battery", Timestamp, percentage, voltage, current, status]
  sensordata.push(output);
  log(JSON.stringify(output))
  // return {
  //   Timestamp: Timestamp,
  //   percentage: percentage,
  //   voltage: voltage,
  //   current: current,
  //   status: status
  // }
}

// 0x00800000-0001-11e1-ac36-0002a5d5c51b 
function acceleromter_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));


  let Timestamp = bytes2int16([bytes[0], bytes[1]])
  let x = bytes2int16([bytes[2], bytes[3]])
  let y = bytes2int16([bytes[4], bytes[5]])
  let z = bytes2int16([bytes[6], bytes[7]])
  // if (x >= 32768) {
  //   x = x - 65536
  // }
  // if (y >= 32768) {
  //   y = y - 65536
  // }
  // if (z >= 32768) {
  //   z = z - 65536
  // }
  // if ((Timestamp + 100) > 65536){}

  document.getElementById("accX").innerHTML = x;
  document.getElementById("accY").innerHTML = y;
  document.getElementById("accZ").innerHTML = z;
  let output = ["acceleromter", Timestamp, x, y, z]
  log(JSON.stringify(output))
  sensordata.push(output);
  // return {
  //   Timestamp: Timestamp,
  //   x: x,
  //   y: y,
  //   z: z,
  // }
}

// 0x00000400-0001-11e1-ac36-0002a5d5c51b
function acceleromter_event_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let acc_event = bytes[2]
  let steps = bytes2int16(bytes[3], bytes[4])
  // if ((Timestamp + 100) > 65536){}
  let output = ["acceleromter_event", Timestamp, acc_event, steps]
  log(JSON.stringify(output))
  // return {
  //   Timestamp: Timestamp,
  //   acc_event: acc_event,
  //   steps: steps
  // }
}

//  0x00040000-0001-11e1-ac36-0002a5d5c51b/0x00010000-0001-11e1-ac36-0002a5d5c51b  one or sec
function temperature_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let temperature = bytes2int16(bytes[2], bytes[3]) / 10
  // if ((Timestamp + 100) > 65536){}

  return {
    Timestamp: Timestamp,
    temperature: temperature,
  }
}

// 0x00100000-0001-11e1-ac36-0002a5d5c51b
function pressure_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let pressure = bytes4int32(bytes[2], bytes[3], bytes[4], bytes[5]) / 100

  // if ((Timestamp + 100) > 65536){}

  return {
    Timestamp: Timestamp,
    pressure: pressure,
  }
}

// 0x00200000-0001-11e1-ac36-0002a5d5c51b
function magnetometer_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16([bytes[0], bytes[1]])
  let x = bytes2int16([bytes[2], bytes[3]])
  let y = bytes2int16([bytes[4], bytes[5]])
  let z = bytes2int16([bytes[6], bytes[7]])
  // if ((Timestamp + 100) > 65536){}

  document.getElementById("magnX").innerHTML = x;
  document.getElementById("magnY").innerHTML = y;
  document.getElementById("magnZ").innerHTML = z;


  let output = ["magnetometer", Timestamp, x, y, z]
  log(JSON.stringify(output))
  sensordata.push(output);
  // return {
  //   Timestamp: Timestamp,
  //   x: x,
  //   y: y,
  //   z: z,
  // }
}

// 0x00400000-0001-11e1-ac36-0002a5d5c51b
function gyroscope_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a;
  // let bytes = a.toString();
  let Timestamp = bytes2int16([bytes[0], bytes[1]])
  let x = bytes2int16([bytes[2], bytes[3]]) / 10
  let y = bytes2int16([bytes[4], bytes[5]]) / 10
  let z = bytes2int16([bytes[6], bytes[7]]) / 10
  // if ((Timestamp + 100) > 65536){}

  document.getElementById("gyroX").innerHTML = x;
  document.getElementById("gyroY").innerHTML = y;
  document.getElementById("gyroZ").innerHTML = z;
  let output = ["gyroscope", Timestamp, x, y, z]
  // log(JSON.stringify(bytes))
  sensordata.push(output);

  // return {
  //   Timestamp: Timestamp,
  //   x: x,
  //   y: y,
  //   z: z,
  // }
}
