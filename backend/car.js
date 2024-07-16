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

// default values
const canData = {
    speed: 0,
    revs: 0,
    up: true,
    fuel: 500,
    gear: 1,
    index: 0,
}
const started = canData;

const engine = () => {
    const now = started;
    // while gears are engaged and there is fuel inscrease speed
    if (now.fuel > 0) {
        // if engine is on in neutral, raise them to 900
        if (now.gear === 0 && now.revs < 700) {
            console.log("neutral engine under 700revs");
            now.revs += 100;
        }
        else if (now.gear === 0 && (now.revs >= 700)) {
            console.log("neutral engine over 700revs >=");
            now.revs -= 100;
        }
        // fluctuate rpms to increase from 2000rpms to 6000rpms as speed increases
        // simulating gear shifting in a vehicle

        // continue to inscrease speed until rmps reach 6000rpms
        if (now.gear != 0 && now.revs < 6000) {
            console.log("in gear, increase speed +1, revs +200");
            now.revs += 200;
            now.speed++;
        }
        // whenever rpms reach high numbers its time to shift gears
        else if (now.gear != 0 && now.revs >= 6000) {
            // if the gear is not maxed out, quickly shift gears up and drop rpms
            if (now.gear < 6) {
                console.log("if revs are over 6k gear++, drop revs")
                now.revs -= 3000;
                now.gear++;
                now.speed -= 5;
            }
            else if (now.gear >= 6) {
                // if car is in max gear inscrease speed until it reaches max
                // speed and rpms
                if (now.revs < 9000) {
                    console.log("if gear is maxed out and increase revs and speed until max")
                    now.revs += 50;
                    now.speed++;
                }
            }
        }
        // Fuel gradually decays
        now.fuel -= 1;

        // Using an index alternate between adding and subtracting revs
        // simulating an engines fluctuation
        if (now.index % 2 === 0) {
            now.revs += 50;
        } else {
            now.revs -= 50;
        }

    }
    // if there is no fuel kill the engine
    else if (now.fuel === 0) {
        // set car in neutral
        now.gear = 0;
        // gradually reduce speed
        if (now.speed > 0) {
            if (now.speed >= 3) {
                now.speed -= 3;
            }
            else if (now.speed >= 1) {
                now.speed -= 1;
            }
        }

        // gradually reduce rpms
        if (now.revs > 0) {
            if (now.revs >= 150) {
                now.revs -= 150;
            }
            else if (now.revs >= 50) {
                console.log('revs are bigger than 50');
                now.revs -= 50;
            }
            else if (now.revs >= 10) {
                console.log('revs are bigger than 10');
                now.revs -= 10;
            }
            else if (now.revs >= 5) {
                console.log('revs are bigger than 5');
                now.revs -= 5;
            }
            else if (now.revs >= 1) {
                console.log('revs are bigger than 1');
                now.revs -= 1;
            }
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

    if (now.fuel === 0, now.speed === 0, now.revs === 0) {
        return
    }
}

// run script every 10 times per second
setInterval(engine, 100);

channel.start();