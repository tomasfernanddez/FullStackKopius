import peopleData from "../data/people.data.js";
import makePerson from "../factories/person.factory.js";

import { generateId } from "../adapters/id.adapter.js";
import { calculateAge } from "../adapters/age.adapter.js";

const createPerson = makePerson({ generateId, calculateAge });

export const getPeopleData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (peopleData.length === 0) {
        reject(new Error("No hay datos de personas disponibles."));
        return;
      }

      resolve(peopleData);
    }, 1000);
  });
};

export const buildPeopleReport = async () => {
  const data = await getPeopleData();

  const people = data
    .map(({ name, birthdate }) => createPerson(name, birthdate))
    .map((person) => ({ ...person, isAdult: person.age >= 18 }));

  const adults = people.filter((person) => person.isAdult);

  const totalAge = people.reduce((sum, person) => sum + person.age, 0);
  const averageAge = totalAge / people.length;

  return {
    generatedAt: new Date().toISOString(),
    total: people.length,
    adults,
    averageAge,
  };
};