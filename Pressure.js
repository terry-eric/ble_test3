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