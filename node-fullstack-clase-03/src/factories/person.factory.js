const makePerson = ({ generateId, calculateAge }) => {
  return (name, birthdate) => ({
    uid: generateId(),
    name,
    birthdate,
    age: calculateAge(birthdate),
  });
};

export default makePerson;