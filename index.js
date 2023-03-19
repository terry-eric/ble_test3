var battery_Characteristic, Acceleromter_Characteristic, magnetometer_Characteristic;
const sensordata = [];

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');

startBtn.addEventListener("click", onStartButtonClick);
stopBtn.addEventListener("click", onStopButtonClick);

function log(text) {
  document.querySelector("#log").value += text + "\n"
}

async function onStartButtonClick() {
  // add new
  let serviceUuid = "00000000-0001-11e1-9ab4-0002a5d5c51b";
  let batteryUuid = "00020000-0001-11e1-ac36-0002a5d5c51b";
  let AcceleromterUuid = "00800000-0001-11e1-ac36-0002a5d5c51b";
  // let Acceleromter_eventUuid = "00000400-0001-11e1-ac36-0002a5d5c51b";
  let magnetometerUuid = "00200000-0001-11e1-ac36-0002a5d5c51b";

  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // add newDD
      optionalServices: [serviceUuid, batteryUuid, AcceleromterUuid, magnetometerUuid],
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
    Acceleromter_Characteristic = await service.getCharacteristic(AcceleromterUuid);
    magnetometer_Characteristic = await service.getCharacteristic(magnetometerUuid);
    // Acceleromter_event_Characteristic = await service.getCharacteristic(Acceleromter_eventUuid);

    // add new
    await battery_Characteristic.startNotifications();
    await Acceleromter_Characteristic.startNotifications();
    await magnetometer_Characteristic.startNotifications();
    // await Acceleromter_event_Characteristic.startNotifications();

    log('> Notifications started');
    // add new
    battery_Characteristic.addEventListener('characteristicvaluechanged',
      battery_func);
    Acceleromter_Characteristic.addEventListener('characteristicvaluechanged',
      Acceleromter_func);
    magnetometer_Characteristic.addEventListener('characteristicvaluechanged',
      Magnetometer_func);
    // Acceleromter_event_Characteristic.addEventListener('characteristicvaluechanged',
    // Acceleromter_event_func);



  } catch (error) {
    log('Argh! ' + error);
  }
}

async function onStopButtonClick() {

  try {
    await battery_Characteristic.stopNotifications();
    await Acceleromter_Characteristic.stopNotifications();
    await magnetometer_Characteristic.stopNotifications();
    battery_Characteristic.removeEventListener('characteristicvaluechanged',
      battery_func);
    Acceleromter_Characteristic.removeEventListener('characteristicvaluechanged',
      Acceleromter_func);
    magnetometer_Characteristic.removeEventListener('characteristicvaluechanged',
      Magnetometer_func);
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


function bytes2int16(high, low) {
  return (low << 8) | high
}
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


  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let percentage = bytes2int16(bytes[2], bytes[3]) / 10
  let voltage = bytes2int16(bytes[4], bytes[5]) / 1000
  let current = bytes2int16(bytes[6], bytes[7]) / 10
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
function Acceleromter_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));


  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let x = bytes2int16(bytes[2], bytes[3])
  let y = bytes2int16(bytes[4], bytes[5])
  let z = bytes2int16(bytes[6], bytes[7])
  if (x >= 32768) {
    x = x - 65536
  }
  if (y >= 32768) {
    y = y - 65536
  }
  if (z >= 32768) {
    z = z - 65536
  }
  // if ((Timestamp + 100) > 65536){}

  document.getElementById("accX").innerHTML = x;
  document.getElementById("accY").innerHTML = y;
  document.getElementById("accZ").innerHTML = z;
  let output = ["Acceleromter", Timestamp, x, y, z]
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
function Acceleromter_event_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let acc_event = bytes[2]
  let steps = bytes2int16(bytes[3], bytes[4])
  // if ((Timestamp + 100) > 65536){}
  let output = ["Acceleromter_event", Timestamp, acc_event, steps]
  log(JSON.stringify(output))
  // return {
  //   Timestamp: Timestamp,
  //   acc_event: acc_event,
  //   steps: steps
  // }
}

//  0x00040000-0001-11e1-ac36-0002a5d5c51b/0x00010000-0001-11e1-ac36-0002a5d5c51b  one or sec
function Temperature_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let Temperature = bytes2int16(bytes[2], bytes[3]) / 10
  // if ((Timestamp + 100) > 65536){}

  return {
    Timestamp: Timestamp,
    Temperature: Temperature,
  }
}

// 0x00100000-0001-11e1-ac36-0002a5d5c51b
function Pressure_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let Pressure = bytes4int32(bytes[2], bytes[3], bytes[4], bytes[5]) / 100

  // if ((Timestamp + 100) > 65536){}

  return {
    Timestamp: Timestamp,
    Pressure: Pressure,
  }
}

// 0x00200000-0001-11e1-ac36-0002a5d5c51b
function Magnetometer_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  // log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let x = bytes2int16(bytes[2], bytes[3])
  let y = bytes2int16(bytes[4], bytes[5])
  let z = bytes2int16(bytes[6], bytes[7])
  // if ((Timestamp + 100) > 65536){}

  document.getElementById("gyroX").innerHTML = x;
  document.getElementById("gyroY").innerHTML = y;
  document.getElementById("gyroZ").innerHTML = z;


  let output = ["Magnetometer", Timestamp, x, y, z]
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
function Gyroscope_func(event) {

  let value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  let bytes = a.toString();
  log(bytes);
  // log(JSON.stringify(value));
  // log(JSON.stringify(d));
  let Timestamp = bytes2int16(bytes[0], bytes[1])
  let x = bytes2int16(abytes[2], bytes[3]) / 10
  let y = bytes2int16(bytes[4], bytes[5]) / 10
  let z = bytes2int16(bytes[6], bytes[7]) / 10
  // if ((Timestamp + 100) > 65536){}

  return {
    Timestamp: Timestamp,
    x: x,
    y: y,
    z: z,
  }
}
