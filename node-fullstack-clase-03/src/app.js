// Tarea 003
// console.log("My first Node.js app");


// -----------------------------------------------------------------------------------


// Tarea 004 con require
// const CURRENT_DATE = require("./utils/constants");

// Tarea 004 con import
//import { CURRENT_DATE } from "./utils/constants.js";

// Console log tanto con requiere como con import.
// console.log(CURRENT_DATE);


// -----------------------------------------------------------------------------------


// Tarea 005
// import { generateId } from "./adapters/id.adapter.js";
// import { calculateAge } from "./adapters/age.adapter.js";

// import makePerson from "./factories/person.factory.js"

// const createPerson = makePerson({ generateId, calculateAge });

// const people = [
//     createPerson("John Doe", "2000-05-15"),
//     createPerson("Tomás Fernández", "2001-08-01"),
//     createPerson("Facundo Pereira", "2003-01-15"),
//     createPerson("Lionel Messi", "1987-06-24"),
// ]

// console.log(people);

// -----------------------------------------------------------------------------------

// Tarea 007

import { buildPeopleReport } from "./services/person.service.js";

const main = async () => {
  try {
    const report = await buildPeopleReport();
    console.log(report);
  } catch (error) {
    console.error(error.message);
  } finally {
    console.log("Proceso finalizado");
  }
};

main();