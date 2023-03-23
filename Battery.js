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
    // log(JSON.stringify(output))
    // return {
    //   Timestamp: Timestamp,
    //   percentage: percentage,
    //   voltage: voltage,
    //   current: current,
    //   status: status
    // }
  }
  