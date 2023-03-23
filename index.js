var battery_Characteristic, accelerometer_Characteristic, magnetometer_Characteristic, gyroscope_Characteristic;
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
  let accelerometerUuid = "00800000-0001-11e1-ac36-0002a5d5c51b";
  // let accelerometer_eventUuid = "00000400-0001-11e1-ac36-0002a5d5c51b";
  let magnetometerUuid = "00200000-0001-11e1-ac36-0002a5d5c51b";
  let gyroscopeUuid = "00400000-0001-11e1-ac36-0002a5d5c51b";

  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // add newDD
      optionalServices: [serviceUuid, batteryUuid, accelerometerUuid, magnetometerUuid, gyroscopeUuid],
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
    accelerometer_Characteristic = await service.getCharacteristic(accelerometerUuid);
    magnetometer_Characteristic = await service.getCharacteristic(magnetometerUuid);
    gyroscope_Characteristic = await service.getCharacteristic(gyroscopeUuid);
    // accelerometer_event_Characteristic = await service.getCharacteristic(accelerometer_eventUuid);

    // add new
    await battery_Characteristic.startNotifications();
    await accelerometer_Characteristic.startNotifications();
    await magnetometer_Characteristic.startNotifications();
    await gyroscope_Characteristic.startNotifications();
    // await accelerometer_event_Characteristic.startNotifications();

    log('> Notifications started');
    // add new
    battery_Characteristic.addEventListener('characteristicvaluechanged',
      battery_func);
    accelerometer_Characteristic.addEventListener('characteristicvaluechanged',
      accelerometer_func);
    magnetometer_Characteristic.addEventListener('characteristicvaluechanged',
      magnetometer_func);
    gyroscope_Characteristic.addEventListener('characteristicvaluechanged',
      gyroscope_func);
    // accelerometer_event_Characteristic.addEventListener('characteristicvaluechanged',
    // accelerometer_event_func);

  } catch (error) {
    log('Argh! ' + error);
  }
}

async function onStopButtonClick() {

  try {
    await battery_Characteristic.stopNotifications();
    await accelerometer_Characteristic.stopNotifications();
    await magnetometer_Characteristic.stopNotifications();
    await gyroscope_Characteristic.stopNotifications();
    battery_Characteristic.removeEventListener('characteristicvaluechanged',
      battery_func);
    accelerometer_Characteristic.removeEventListener('characteristicvaluechanged',
      accelerometer_func);
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











