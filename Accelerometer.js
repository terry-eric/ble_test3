// 0x00800000-0001-11e1-ac36-0002a5d5c51b 
function accelerometer_func(event) {

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
    let output = ["accelerometer", Timestamp, x, y, z]
    sensordata.push(output);
    // log(JSON.stringify(output))
    // return {
    //   Timestamp: Timestamp,
    //   x: x,
    //   y: y,
    //   z: z,
    // }
  }
  