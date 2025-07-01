// physics/world.js
const { World, Material, ContactMaterial, Body, Plane } = require('cannon-es');

const world = new World();
world.gravity.set(0, -9.82, 0);

// Materials
const groundMaterial = new Material('groundMaterial');
const wheelMaterial = new Material('wheel');

const wheel_ground = new ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.6,
    restitution: 0,
    contactEquationStiffness: 1e6,
    contactEquationRelaxation: 3,
});
world.addContactMaterial(wheel_ground);

// Create the ground plane
const groundShape = new Plane();
const groundBody = new Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.set(0, 0, 0);
world.addBody(groundBody);

module.exports = { world, wheelMaterial };
