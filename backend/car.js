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

const canData = {
    start: 1,
    speed: 0,
    revs: 0,
    up: true,
    fuel: 500,
    gear: 0,
    index: 0,
}
const started = canData;

const engine = () => {
    const now = started;
    // if engine is on in neutral, raise them to 1000
    if (now.gear === 0 && (now.revs <= 0 || now.revs <= 800)) {
        now.revs += 100;
    }

    // while gears are engaged inscrease speed
    if (now.gear !== 0) {

        // fluctuate rpms to increase from 2000rpms to 6000rpms
        if (now.revs < 6000) {
            now.revs += 200;
            now.speed += 1;
        } else if (now.revs >= 6000) {
            if (now.gear < 6) {
                now.revs -= 4000;
                now.gear++;
                now.speed += 1;
            }
        }
    }

    // Use an index to alternate between adding and subtracting revs, simulating an engines fluctuation
    if (now.index % 2 === 0) {
        now.revs += 50;
    } else {
        now.revs -= 50;
    }

    // reduce fuel
    if (now.fuel > 0) {
        now.fuel -= 1;
    }

    // run out of fuel
    if (now.fuel <= 0) {
        if (now.speed >= 0) {
            now.speed -= 5;
        }
    }

    // print results
    console.log("speed = ", now.speed);
    console.log("revs  = ", now.revs);
    console.log("gear  = ", now.gear);
    console.log("fuel  = ", now.fuel);
    console.log("------------------");
    now.index++;

    // send data
    var out = {}
    var buff = Buffer.alloc(8)

    buff.writeUIntBE(now.revs, 0, 4)
    buff.writeUIntBE(now.speed, 4, 2)
    buff.writeUIntBE(now.fuel, 6, 2)

    console.log(buff)
    out.id = msg.id
    out.data = buff

    channel.send(out)
}

// run script every 10 times per second
setInterval(engine, 100);

channel.start();