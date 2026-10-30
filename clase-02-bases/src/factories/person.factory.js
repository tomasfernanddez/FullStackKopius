import { v4 as uuidv4 } from "uuid";
import getAge from "get-age";

export const createPerson = (name, birthdate) => ({ 
    uid: uuidv4(),
    name,
    birthdate,
    age: getAge(birthdate)
});