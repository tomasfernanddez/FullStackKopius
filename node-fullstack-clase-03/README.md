<div align="center">

<a href="https://nodejs.org/en" target="_blank"><img src="https://user-images.githubusercontent.com/3438503/260495760-ca5d8c24-b382-43d9-8fbe-d905b4b208f0.png" width="260" alt="Logo de Node.js" /></a>

# Clase 3 de NodeJS

### Kopius · The Academy · Cohort 05 · M3

**Continuación del reforzamiento de JavaScript: patrones, asincronía, estructuras de datos y closures**

![Node.js](https://img.shields.io/badge/Node.js-24.x-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## CONTENIDO

1. [Adapter Pattern](#1-adapter-pattern)
   - [Tarea 006: Adapter Pattern para dependencias externas](#tarea-006-adapter-pattern-para-dependencias-externas)
2. [Promises](#2-promises)
3. [Async y Await](#3-async-y-await)
4. [Objetos](#4-objetos)
5. [Arrays](#5-arrays)
   - [Principales métodos de arrays](#principales-métodos-de-arrays)
   - [Desestructuración y Spread en arrays](#desestructuración-y-spread-en-arrays)
   - [Tarea 007: Reporte asíncrono de personas](#tarea-007-reporte-asíncrono-de-personas)
6. [Referencias](#referencias)

---

> [!NOTE]
> Esta clase continúa el **Reforzamiento de JavaScript** de la [Clase 2](https://github.com/aduartekopiustech/node-fullstack-clase-02). Allí trabajamos `Functions`, `Callbacks` y `Factory Functions`; ahora profundizamos en patrones, asincronía y estructuras de datos, y cerramos con **closures**, el concepto que explica todo lo anterior.

---

## 1. Adapter Pattern

El **patrón adaptador** (_Adapter Pattern_) es un patrón estructural que permite conectar componentes con interfaces incompatibles. Funciona como un traductor: recibe la forma de uso ofrecida por una dependencia externa y expone la forma que nuestra aplicación necesita.

Sin un adaptador, el código de negocio conoce detalles como el nombre de una función, el formato de una respuesta o la librería que realiza el trabajo. Si esos detalles cambian, también debemos modificar nuestra lógica. El adaptador concentra ese conocimiento en un único lugar y ofrece a la aplicación una interfaz propia y estable.

| Participante    | Responsabilidad                                                     |
| --------------- | ------------------------------------------------------------------- |
| **Aplicación**  | Utiliza una interfaz simple definida por el proyecto                |
| **Adaptador**   | Traduce la llamada o los datos entre la aplicación y la dependencia |
| **Dependencia** | Proporciona la funcionalidad externa que queremos aprovechar        |

Por ejemplo, si una librería exporta una función llamada `uuidv4()`, podemos ocultar ese detalle detrás de un adaptador llamado `generateId()`. El resto de la aplicación solo conoce `generateId()` y no necesita saber qué paquete genera el identificador.

```javascript
// La aplicación utiliza nuestro contrato, no la API de la librería.
const id = generateId();
```

Esta separación reduce el **acoplamiento**, facilita reemplazar dependencias y permite probar la lógica de la aplicación sin depender directamente de implementaciones externas. Un adaptador no agrega reglas de negocio: su responsabilidad es traducir y aislar.

#### Tarea 006: Adapter Pattern para dependencias externas

> [!IMPORTANT]
> **Objetivo**
>
> Aplicar el patrón adaptador sobre las dependencias `uuid` y `get-age` utilizadas en la **Tarea 005**, evitando que la Factory Function `createPerson()` dependa directamente de sus interfaces.
>
> Al finalizar, la Factory Function deberá conservar su comportamiento y utilizar únicamente funciones definidas por nuestro proyecto.

Partiremos del archivo `src/factories/person.factory.js` creado en la clase anterior. Actualmente, este módulo importa y utiliza directamente ambas dependencias:

```javascript
import { v4 as uuidv4 } from "uuid";
import getAge from "get-age";
```

Aunque la implementación funciona, la Factory Function queda acoplada a los nombres y formas de uso de esas librerías. Vamos a colocar adaptadores entre nuestra lógica y las dependencias externas.

**1. Crear el directorio de adaptadores**

Dentro de `src`, crear un directorio llamado `adapters` con dos módulos:

```text
node-fullstack-clase-03/
├── src/
│   ├── adapters/
│   │   ├── age.adapter.js
│   │   └── id.adapter.js
│   ├── factories/
│   │   └── person.factory.js
│   └── app.js
├── package.json
└── package-lock.json
```

**2. Definir los contratos de nuestra aplicación**

Implementar y exportar las siguientes funciones:

| Adaptador        | Función                   | Resultado esperado               |
| ---------------- | ------------------------- | -------------------------------- |
| `id.adapter.js`  | `generateId()`            | Un identificador UUID v4         |
| `age.adapter.js` | `calculateAge(birthdate)` | La edad calculada como un número |

Cada adaptador deberá importar únicamente la dependencia que necesita. Estos serán los únicos módulos del proyecto autorizados para conocer y utilizar directamente `uuid` y `get-age`.

> [!NOTE]
> `calculateAge()` deberá recibir la fecha de nacimiento en formato `YYYY-MM-DD`, igual que en la tarea anterior.

**3. Refactorizar la Factory Function**

Modificar `src/factories/person.factory.js` para que:

1. Elimine las importaciones directas de `uuid` y `get-age`.
2. Importe `generateId()` y `calculateAge()` desde los adaptadores.
3. Mantenga la firma `createPerson(name, birthdate)`.
4. Continúe retornando un objeto con las propiedades `id`, `name`, `birthdate` y `age`.

**4. Verificar el comportamiento**

Ejecutar la aplicación con:

```bash
npm start
```

La creación de personas deberá producir el mismo resultado que antes de la refactorización. El cambio estará en la organización interna del código, no en su comportamiento observable.

**Criterios de aceptación**

- `person.factory.js` no importa paquetes externos.
- Cada dependencia externa se utiliza únicamente desde su adaptador.
- `createPerson()` conserva su interfaz y la estructura del objeto retornado.
- La aplicación se ejecuta correctamente mediante `npm start`.

> [!TIP]
> **Desafío**
>
> Imaginemos que mañana debemos reemplazar `uuid` o `get-age` por otra librería. Identificar qué archivos deberían modificarse y explicar por qué la Factory Function debería permanecer sin cambios.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 2. Promises

En Node.js es frecuente iniciar operaciones cuyo resultado no está disponible inmediatamente: leer un archivo, consultar una base de datos, consumir una API o esperar un temporizador. Si el programa se detuviera hasta recibir cada respuesta, no podría aprovechar el tiempo de espera para continuar con otras tareas.

Una **promesa** (_Promise_) es un objeto que representa el resultado futuro de una operación asíncrona. No es el resultado en sí mismo: es el compromiso de que más adelante recibiremos un valor o un error.

Una promesa puede encontrarse en tres estados:

| Estado        | Significado                                      |
| ------------- | ------------------------------------------------ |
| **Pending**   | La operación todavía está en proceso             |
| **Fulfilled** | La operación finalizó correctamente con un valor |
| **Rejected**  | La operación finalizó con un error                |

Una promesa comienza como `pending` y solo puede cambiar una vez a `fulfilled` o `rejected`. Una vez resuelta o rechazada, su estado ya no puede volver a cambiar.

### Crear una promesa

El constructor `Promise` recibe una función con dos callbacks:

- `resolve(value)`: completa la operación correctamente.
- `reject(error)`: informa que la operación falló.

```javascript
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!id) {
        reject(new Error("User ID is required"));
        return;
      }

      resolve({ id, name: "John Doe" });
    }, 500);
  });
};
```

`setTimeout()` simula una operación que necesita tiempo. En una aplicación real, la promesa podría representar una consulta a una API o una base de datos.

### Consumir una promesa

Utilizamos tres métodos para reaccionar cuando la operación finaliza:

| Método       | Cuándo se ejecuta                             |
| ------------ | --------------------------------------------- |
| `.then()`    | Cuando la promesa se resuelve correctamente   |
| `.catch()`   | Cuando la promesa es rechazada                |
| `.finally()` | Siempre, independientemente del resultado     |

```javascript
getUserById(1)
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error(error.message);
  })
  .finally(() => {
    console.log("Operation completed");
  });
```

Los métodos `.then()` pueden encadenarse. Cada uno devuelve una nueva promesa y recibe el valor retornado por el paso anterior.

```javascript
getUserById(1)
  .then((user) => ({ ...user, isActive: true }))
  .then((user) => console.log(user))
  .catch((error) => console.error(error.message));
```

> [!IMPORTANT]
> Si una función inicia una promesa, debe retornarla. De lo contrario, quien invoque la función no podrá esperar su resultado ni manejar correctamente sus errores.

### Ejecutar varias promesas

Cuando varias operaciones son independientes, podemos iniciar sus promesas y utilizar `Promise.all()` para esperar todos los resultados como un conjunto.

```javascript
const getUsers = () => {
  return Promise.all([getUserById(1), getUserById(2)]);
};
```

Si alguna de las promesas es rechazada, `Promise.all()` también se rechaza. Este comportamiento evita continuar como si el conjunto completo hubiera finalizado correctamente.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 3. Async y Await

`async` y `await` permiten consumir promesas con una sintaxis similar al código secuencial. No reemplazan a las promesas: trabajan sobre ellas y facilitan su lectura.

| Palabra   | Responsabilidad                                                                  |
| --------- | -------------------------------------------------------------------------------- |
| `async`   | Declara una función asíncrona que siempre devuelve una promesa                   |
| `await`   | Suspende esa función hasta que una promesa se resuelve o es rechazada            |

Aunque una función `async` retorne un valor común, JavaScript lo envuelve automáticamente en una promesa.

```javascript
const getMessage = async () => {
  return "Hello";
};

getMessage().then((message) => console.log(message));
```

### Esperar el resultado

Utilizando `getUserById()` de la sección anterior:

```javascript
const showUser = async () => {
  try {
    const user = await getUserById(1);

    console.log(user.name);
  } catch (error) {
    console.error(error.message);
  } finally {
    console.log("Operation completed");
  }
};

showUser();
```

Cuando la promesa se resuelve, `await` entrega su valor. Si es rechazada, produce un error que puede manejarse con `try/catch`.

> [!NOTE]
> `await` suspende únicamente la función `async` que lo contiene. No bloquea todo Node.js: el entorno puede continuar procesando otras operaciones mientras espera.

### Operaciones secuenciales y concurrentes

Si una operación necesita el resultado de la anterior, debemos esperarlas en orden. Si son independientes, podemos iniciarlas juntas y esperar sus resultados concurrentemente con `Promise.all()`.

```javascript
const loadUsers = async () => {
  const [firstUser, secondUser] = await Promise.all([
    getUserById(1),
    getUserById(2),
  ]);

  return [firstUser, secondUser];
};
```

La idea central es simple: **secuencial cuando existe dependencia; concurrente cuando las operaciones son independientes**. Iniciar todo junto sin analizar las dependencias puede producir errores, pero esperar innecesariamente cada operación puede volver más lenta la aplicación.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 4. Objetos

Un **objeto** agrupa información relacionada mediante pares de **clave y valor**. En lugar de manejar variables aisladas para el nombre, la edad y el estado de una persona, podemos representar todo como una única entidad.

En Node.js utilizamos objetos para modelar entidades, configurar funciones, intercambiar datos entre módulos y representar respuestas de APIs.

> [!TIP]
> Para la Tarea 007, concentrarse especialmente en crear objetos, desestructurar propiedades y utilizar spread. Las referencias y `this` amplían el concepto, pero no son necesarias para resolver el ejercicio principal.

### Crear y acceder a un objeto

```javascript
const user = {
  id: 1,
  name: "John Doe",
  age: 25,
  isActive: true,
};

console.log(user.name); // John Doe
console.log(user["age"]); // 25
```

La notación de punto es la más habitual. Los corchetes son útiles cuando el nombre de la propiedad está almacenado en una variable.

```javascript
const property = "isActive";

console.log(user[property]); // true
```

### Modificar propiedades y referencias

Aunque un objeto se declare con `const`, sus propiedades pueden modificarse. `const` impide reasignar la variable, pero no vuelve inmutable al objeto.

```javascript
user.age = 26;
user.email = "john@example.com";
```

Los objetos se manejan mediante referencias. Si dos variables apuntan al mismo objeto, una modificación realizada desde cualquiera de ellas será visible desde la otra.

```javascript
const userReference = user;

userReference.name = "Anna Smith";

console.log(user.name); // Anna Smith
```

Este comportamiento es importante porque una modificación accidental puede afectar otras partes de la aplicación.

### Métodos

Una propiedad que contiene una función se denomina **método**. Los métodos representan comportamientos relacionados con el objeto.

```javascript
const userWithGreeting = {
  name: "John Doe",
  greet() {
    return `Hello, ${this.name}`;
  },
};

console.log(userWithGreeting.greet()); // Hello, John Doe
```

Dentro de un método tradicional, `this` permite acceder al objeto que ejecutó el método.

> [!WARNING]
> Las arrow functions no crean su propio `this`. Por ese motivo, no siempre son adecuadas como métodos cuando necesitamos acceder al objeto mediante `this`.

### Desestructuración de objetos

La desestructuración permite extraer propiedades y asignarlas a variables. También podemos renombrarlas y definir valores predeterminados.

```javascript
const product = {
  id: 1,
  name: "Keyboard",
  price: 80,
};

const { name, price, stock = 0 } = product;
const { price: currentPrice } = product;

console.log(name); // Keyboard
console.log(price); // 80
console.log(stock); // 0
console.log(currentPrice); // 80
```

### Spread e inmutabilidad

El operador spread (`...`) permite crear un nuevo objeto copiando las propiedades de otro. Las propiedades declaradas después sobrescriben las anteriores.

```javascript
const baseUser = {
  name: "John Doe",
  age: 25,
};

const updatedUser = {
  ...baseUser,
  age: 26,
  isActive: true,
};

console.log(baseUser.age); // 25
console.log(updatedUser.age); // 26
```

Este enfoque favorece la **inmutabilidad**: en lugar de modificar el objeto original, creamos una nueva versión. Es una práctica útil para reducir efectos secundarios y entender con mayor facilidad cómo cambian los datos.

> [!WARNING]
> Spread realiza una copia superficial (_shallow copy_). Si el objeto contiene otros objetos o arrays, esas estructuras anidadas continúan compartiendo sus referencias.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 5. Arrays

Un **array** es una colección ordenada de valores. Cada elemento ocupa una posición identificada por un índice numérico que comienza en `0`.

Los arrays permiten trabajar con grupos de datos: personas, productos, mensajes o resultados obtenidos desde una base de datos.

> [!TIP]
> Para la Tarea 007, el foco estará en arrays de objetos y en utilizar `map()`, `filter()` y `reduce()` sin modificar la colección original.

### Crear y recorrer un array

```javascript
const cryptocurrencies = ["Bitcoin", "Ethereum", "Stellar"];

console.log(cryptocurrencies[0]); // Bitcoin
console.log(cryptocurrencies.length); // 3
```

Podemos recorrerlo con `for...of` cuando solo necesitamos leer cada elemento.

```javascript
for (const cryptocurrency of cryptocurrencies) {
  console.log(cryptocurrency);
}
```

### Operaciones que modifican y operaciones que crean

No todas las operaciones trabajan de la misma forma. Algunos métodos modifican el array original, mientras que otros métodos y sintaxis crean uno nuevo.

| Modifican el original | Devuelven un nuevo array |
| --------------------- | ------------------------ |
| `push()`              | `map()`                  |
| `pop()`               | `filter()`               |
| `shift()`             | `slice()`                |
| `unshift()`           | `concat()`               |
| `splice()`            | Spread (`...`)           |

```javascript
const participantNames = ["John", "Anna"];

participantNames.push("Robert");

const updatedNames = [...participantNames, "Maria"];
```

Conocer esta diferencia evita modificaciones inesperadas y ayuda a elegir conscientemente entre mutación e inmutabilidad.

### Arrays de objetos

En aplicaciones reales es común recibir colecciones de objetos. Cada elemento representa una entidad con sus propias propiedades.

```javascript
const products = [
  { id: 1, name: "Keyboard", price: 80 },
  { id: 2, name: "Mouse", price: 40 },
  { id: 3, name: "Monitor", price: 300 },
];

console.log(products[0].name); // Keyboard
```

### Principales métodos de arrays

Los métodos de arrays reciben callbacks y permiten expresar con claridad qué operación queremos realizar.

**`forEach()` — Recorrer elementos**

Ejecuta una función por cada elemento y retorna `undefined`. Se utiliza principalmente para producir un efecto secundario, como mostrar información.

```javascript
products.forEach((product) => {
  console.log(product.name);
});
```

**`map()` — Transformar elementos**

Crea un nuevo array con la misma cantidad de elementos, transformando cada uno.

```javascript
const productNames = products.map((product) => product.name);

console.log(productNames); // ['Keyboard', 'Mouse', 'Monitor']
```

> [!TIP]
> Utilizar `map()` cuando necesitamos el array resultante y `forEach()` cuando solo necesitamos ejecutar una acción por cada elemento.

**`filter()` — Filtrar elementos**

Crea un nuevo array con todos los elementos que cumplen una condición.

```javascript
const expensiveProducts = products.filter((product) => product.price > 100);

console.log(expensiveProducts);
```

**`find()` — Buscar un elemento**

Devuelve el primer elemento que cumple una condición. Si no encuentra ninguno, devuelve `undefined`.

```javascript
const foundProduct = products.find((item) => item.id === 2);

console.log(foundProduct); // { id: 2, name: 'Mouse', price: 40 }
```

**`some()` y `every()` — Verificar condiciones**

`some()` comprueba si al menos un elemento cumple una condición.

`every()` comprueba si todos los elementos cumplen una condición.

```javascript
const hasExpensiveProduct = products.some((product) => product.price > 250);
const allHavePositivePrice = products.every((product) => product.price > 0);

console.log(hasExpensiveProduct); // true
console.log(allHavePositivePrice); // true
```

**`reduce()` — Acumular valores**

Recorre el array y produce un único resultado acumulado. El segundo argumento representa el valor inicial del acumulador.

```javascript
const total = products.reduce((sum, product) => sum + product.price, 0);

console.log(total); // 420
```

Definir el valor inicial evita errores con arrays vacíos y hace explícito el tipo de resultado que queremos construir.

### Combinar métodos

Los métodos pueden encadenarse para formar una secuencia de transformaciones. Cada paso debe tener una responsabilidad clara.

```javascript
const affordableProductNames = products
  .filter((product) => product.price <= 100)
  .map((product) => product.name);

console.log(affordableProductNames); // ['Keyboard', 'Mouse']
```

### Desestructuración y Spread en arrays

La desestructuración permite extraer elementos según su posición. Spread permite crear o combinar arrays sin modificar los originales.

```javascript
const orderedNames = ["John", "Anna", "Robert"];

const [first, second] = orderedNames;

const extendedNames = [...orderedNames, "Maria"];

console.log(first); // John
console.log(second); // Anna
console.log(extendedNames); // ['John', 'Anna', 'Robert', 'Maria']
```

#### Tarea 007: Reporte asíncrono de personas

> [!IMPORTANT]
> **Objetivo**
>
> Construir un reporte de personas que integre **Promises**, **Async/Await**, **Objetos** y **Arrays**, reutilizando la Factory Function y los adaptadores implementados en la Tarea 006.
>
> Al finalizar, la aplicación deberá obtener datos de manera asíncrona, transformarlos sin modificar el array original y presentar un resumen calculado.

**Escenario**

Nuestra aplicación recibe datos básicos de personas desde una fuente externa simulada. Cada registro contiene únicamente `name` y `birthdate`. Debemos convertir esos datos en objetos persona, identificar a las personas adultas y construir un reporte.

**1. Crear la fuente de datos**

Crear `src/data/people.data.js` y exportar un array con al menos cuatro objetos:

```javascript
const peopleData = [
  { name: "John Doe", birthdate: "2000-05-15" },
  { name: "Anna Smith", birthdate: "2010-10-20" },
  { name: "Robert Johnson", birthdate: "1988-02-10" },
  { name: "Maria Garcia", birthdate: "2008-12-01" },
];

export default peopleData;
```

**2. Simular una operación asíncrona**

Crear `src/services/person.service.js`. En la parte superior, importar la fuente de datos y la Factory Function:

```javascript
import peopleData from "../data/people.data.js";
import createPerson from "../factories/person.factory.js";
```

Luego, implementar `getPeopleData()`.

La función deberá:

1. Retornar una nueva promesa.
2. Utilizar `setTimeout()` para simular una espera de un segundo.
3. Resolver la promesa con el array cuando existan registros.
4. Rechazarla con un objeto `Error` cuando el array esté vacío.
5. Exportar la función para que pueda verificarse desde otros módulos.

**3. Construir el reporte**

En el mismo servicio, implementar y exportar una función `async` llamada `buildPeopleReport()` que:

1. Obtenga los datos utilizando `await getPeopleData()`.
2. Utilice desestructuración para extraer `name` y `birthdate` de cada registro.
3. Utilice `map()` y `createPerson()` para crear las personas completas.
4. Utilice spread para agregar `isAdult`, cuyo valor será `true` cuando `age >= 18`.
5. Utilice `filter()` para obtener únicamente las personas adultas.
6. Utilice `reduce()` para calcular la edad promedio de todas las personas.
7. Genere la fecha del reporte mediante `new Date().toISOString()`.
8. Retorne un objeto con la siguiente estructura:

```javascript
{
  generatedAt: "2026-11-02T20:30:00.000Z",
  total: 4,
  adults: [/* adult person objects */],
  averageAge: 24.25
}
```

> [!NOTE]
> `generatedAt` deberá obtenerse dinámicamente. Los identificadores, las edades y el promedio del ejemplo son ilustrativos y pueden variar según la fecha de ejecución.

**4. Ejecutar y manejar errores**

Desde `src/app.js`, importar el servicio:

```javascript
import { buildPeopleReport } from "./services/person.service.js";
```

Luego, crear una función `main()` declarada con `async` que:

1. Utilice `try/catch/finally`.
2. Espere el resultado de `buildPeopleReport()`.
3. Muestre el reporte completo con `console.log()`.
4. Muestre el mensaje del error cuando la operación falle.
5. Informe desde `finally` que el proceso terminó.
6. Ejecute la función invocando `main()` al final del archivo.

**Estructura esperada**

```text
node-fullstack-clase-03/
├── src/
│   ├── adapters/
│   ├── data/
│   │   └── people.data.js
│   ├── factories/
│   │   └── person.factory.js
│   ├── services/
│   │   └── person.service.js
│   └── app.js
├── package.json
└── package-lock.json
```

**Criterios de aceptación**

- La obtención de datos retorna una promesa y contempla `resolve` y `reject`.
- El reporte se construye mediante `async/await` y maneja errores con `try/catch`.
- Los registros y el reporte se representan mediante objetos.
- Se utilizan `map()`, `filter()` y `reduce()` con responsabilidades diferentes.
- El array original no se modifica.
- La aplicación se ejecuta correctamente mediante `npm start`.

> [!TIP]
> **Desafío**
>
> Vaciar temporalmente `peopleData` para comprobar el camino de error. Verificar que se muestre el mensaje correspondiente y que el bloque `finally` se ejecute tanto en caso de éxito como de error.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## Referencias

- 📘 [MDN — Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- 📘 [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- 📘 [MDN — Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- 📘 [MDN — Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- 📘 [MDN — Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- 📘 [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- 🛠️ [Refactoring Guru — Adapter](https://refactoring.guru/design-patterns/adapter)

## Mentor

**Ariel Duarte** · Kopius · The Academy

<sub>[⬆ Volver al índice](#contenido)</sub>
