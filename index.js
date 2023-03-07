var battery_Characteristic, Acceleromter_Characteristic;

let startBtn = document.querySelector('#start');
let stopBtn = document.querySelector('#stop');
startBtn.addEventListener("click", onStartButtonClick)
// stopBtn.addEventListener("click", onStopButtonClick)

function log(text) {
  document.querySelector("#log").value += text + "\n"
}

async function onStartButtonClick() {
  // add new
  let serviceUuid = "00000000-0001-11e1-9ab4-0002a5d5c51b";
  let batteryUuid = "00020000-0001-11e1-ac36-0002a5d5c51b";
  let AcceleromterUuid = "00800000-0001-11e1-ac36-0002a5d5c51b";

  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
      // add newDD
      optionalServices: [serviceUuid, batteryUuid, AcceleromterUuid],
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

    // add new
    await battery_Characteristic.startNotifications();
    // await Acceleromter_Characteristic.startNotifications();

    log('> Notifications started');
    // add new
    battery_Characteristic.addEventListener('characteristicvaluechanged',
      handleNotifications);
    // Acceleromter_Characteristic.addEventListener('characteristicvaluechanged',
    //   handleNotifications);

  } catch (error) {
    log('Argh! ' + error);
  }
}

// async function onStopButtonClick() {
//   if (myCharacteristic) {
//     try {
//       await myCharacteristic.stopNotifications();
//       log('> Notifications stopped');
//       myCharacteristic.removeEventListener('characteristicvaluechanged',
//         handleNotifications);
//     } catch (error) {
//       log('Argh! ' + error);
//     }
//   }
// }

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  // log('> ' + a.join(' '));
  let d = battery_func(value)
  log(d);
  log(JSON.stringify(d));

}

function bytes2int16(high, low) {
  return (low << 8) | high
}


function battery_func(a) {
  let Timestamp = bytes2int16(a[0], a[1])
  let percentage = bytes2int16(a[2], a[3]) / 10
  let voltage = bytes2int16(a[4], a[5]) / 1000
  let current = bytes2int16(a[6], a[7]) / 10
  let status = parseInt(a[8])

  if (Timestamp)
    if (status == 2) { percentage = 0; current = 0 }

  return {
    Timestamp: Timestamp,
    percentage: percentage,
    voltage: voltage,
    current: current,
    status: status
  }
}


// let hi = bytes2int16(0xa0,0x02)
// console.log(hi);
// 0x68,0x96,0xa0,0x02,0xd0,0x0c,0x00,0x80,0x02 //battery


