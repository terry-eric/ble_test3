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
  log(JSON.stringify(bytes))
  sensordata.push(output);

  // return {
  //   Timestamp: Timestamp,
  //   x: x,
  //   y: y,
  //   z: z,
  // }
}
