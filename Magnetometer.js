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
  // log(JSON.stringify(output))
  sensordata.push(output);
  // return {
  //   Timestamp: Timestamp,
  //   x: x,
  //   y: y,
  //   z: z,
  // }
}