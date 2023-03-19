var magnetometer_Characteristic;
const sensordata = [];

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');
startBtn.addEventListener("click", onStartButtonClick)
stopBtn.addEventListener("click", onStopButtonClick)

function log(text) {
  document.querySelector("#log").value += text + "\n"
}

async function onStartButtonClick() {
  // add new
  let serviceUuid = "00000000-0001-11e1-9ab4-0002a5d5c51b";
  let magnetometerUuid = "00200000-0001-11e1-ac36-0002a5d5c51b";

  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // add newDD
      optionalServices: [serviceUuid, magnetometerUuid],
      acceptAllDevices: true
    });

    log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    log('Getting Characteristic...');
    // add new
    magnetometer_Characteristic = await service.getCharacteristic(magnetometerUuid);
    // Acceleromter_event_Characteristic = await service.getCharacteristic(Acceleromter_eventUuid);
    await magnetometer_Characteristic.startNotifications();
    log('> Notifications started');
    // add new
    magnetometer_Characteristic.addEventListener('characteristicvaluechanged',
      Magnetometer_func);




  } catch (error) {
    log('Argh! ' + error);
  }
}

async function onStopButtonClick() {

  try {
    await magnetometer_CharacteristicCharacteristic.stopNotifications();
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
  let x = bytes2int16(bytes[2], bytesa[3])
  let y = bytes2int16(bytes[4], bytes[5])
  let z = bytes2int16(bytes[6], bytes[7])
  // if ((Timestamp + 100) > 65536){}

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

