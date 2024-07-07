// The CAN network driver provides a generic interface to setup, 
// configure and monitor CAN devices. To configure bit-timing 
// parameters use the program ip
const can = require("socketcan");
// The virtual CAN driver (vcan)
const channel = can.createRawChannel('vcan0', true);

var msg = {
    'id': 500,
    data: [0, 0, 0, 0, 0, 0, 0, 0]
}

var speed = 0
var revs = 0
var up = true
var fuel = 500
var temp = 210

setInterval(() => {
    var out = {}
    var buff = Buffer.alloc(8)
    if (speed < 113) {
        speed = speed + 1
        revs = revs + 240
        fuel = fuel - 1
    } else {
        if (up) {
            revs = revs + 100
            up = false
        } else {
            revs = revs - 100
            up = true
        }
        fuel = fuel - 1
    }

    if (revs > 7000) {
        revs = 1000
    }

    if (fuel == 0) {                                                          /////////////////////////////////////////////////////////////
        speed = 0
        revs = 0
        fuel = 0                                               ////////////////////////////////////////////////////////////
    }

    buff.writeUIntBE(revs, 0, 4)
    buff.writeUIntBE(speed, 4, 2)
    buff.writeUIntBE(fuel, 6, 2)
    // attempt to add new gauge 
    buff.writeUIntBE(temp, 2, 4)


    console.log(buff)
    out.id = msg.id
    out.data = buff

    channel.send(out)
}, 1000)

channel.start();