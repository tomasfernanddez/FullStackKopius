<div align="center">

<a href="https://nodejs.org/en" target="_blank"><img src="https://user-images.githubusercontent.com/3438503/260495760-ca5d8c24-b382-43d9-8fbe-d905b4b208f0.png" width="260" alt="Logo de Node.js" /></a>

# Clase 2 de NodeJS

### Kopius · The Academy · Cohort 05 · M2

**Generalidades de Node y reforzamiento de JavaScript necesarios para el desarrollo con Node.js**

![Node.js](https://img.shields.io/badge/Node.js-24.x-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## CONTENIDO

1. [Package.json, node_modules y scripts](#1-packagejson-node_modules-y-scripts)
   - [Tarea 003: Creación de nuestra primera aplicación con Node.js](#tarea-003-creación-de-nuestra-primera-aplicación-con-nodejs)
2. [Módulos, importaciones y exportaciones](#2-módulos-importaciones-y-exportaciones)
   - [CommonJS: module.exports y require()](#commonjs-moduleexports-y-require)
   - [Tarea 004: Importación y exportación de módulos en Node.js](#tarea-004-importación-y-exportación-de-módulos-en-nodejs)
3. [Node_modules, dependencias de producción y desarrollo](#3-node_modules-dependencias-de-producción-y-desarrollo)
   - [Dependencias de producción](#dependencias-de-producción)
   - [Dependencias de desarrollo](#dependencias-de-desarrollo)
   - [Nuestro archivo package.json](#nuestro-archivo-packagejson)
   - [¿Por qué es importante diferenciarlas?](#por-qué-es-importante-diferenciarlas)
4. [Reforzamiento de JavaScript](#4-reforzamiento-de-javascript)
   - [4.1 Functions](#41-functions)
   - [4.2 Callbacks](#42-callbacks)
   - [4.3 Factory Functions](#43-factory-functions)
5. [Referencias](#referencias)

---

## 1. Package.json, node_modules y scripts

El archivo `package.json` es el documento de identidad de un proyecto Node.js: declara su nombre, su versión, sus dependencias y los comandos que podemos ejecutar con NPM.

### Tarea 003: Creación de nuestra primera aplicación con Node.js

> [!IMPORTANT]
> **Objetivo**
>
> Crear y ejecutar nuestra primera aplicación con Node.js, familiarizándonos con la estructura básica de un proyecto, el uso de NPM y la configuración del archivo `package.json`.
>
> Al finalizar esta tarea, deberemos ser capaces de ejecutar nuestra aplicación utilizando el comando `npm start`.

#### Procedimiento

**1. Crear el directorio del proyecto**

Desde la terminal de comandos, ubicarse en el directorio de trabajo y crear una carpeta llamada `clase-02-bases`.

**2. Inicializar el proyecto con NPM**

Ingresar al directorio creado y ejecutar:

```bash
npm init
```

Durante la inicialización, completar los siguientes campos:

| Campo              | Valor                                                      |
| ------------------ | ---------------------------------------------------------- |
| **package name**   | `clase-02-bases`                                           |
| **version**        | mantener `1.0.0` o utilizar `0.0.1` (versionado semántico) |
| **description**    | `Mi primera aplicación con Node.js`                        |
| **entry point**    | mantener `index.js`                                        |
| **test command**   | dejar vacío                                                |
| **git repository** | URL del repositorio de GitHub (opcional)                   |
| **keywords**       | dejar vacío                                                |
| **author**         | nombre del desarrollador                                   |
| **license**        | mantener el valor predeterminado `ISC`                     |

Finalmente, confirmar la configuración:

```text
Is this OK? (yes)
```

**3. Crear la estructura de archivos**

En la raíz del proyecto, crear una carpeta llamada `src` y, dentro de ella, un archivo llamado `app.js`.

La estructura deberá ser la siguiente:

```text
clase-02-bases/
├── src/
│   └── app.js
└── package.json
```

**4. Escribir nuestro primer programa**

Dentro de `src/app.js`, agregar el siguiente código:

```javascript
console.log("My first Node.js app");
```

**5. Ejecutar la aplicación**

Utilizando la terminal, ejecutar nuestra aplicación y comprobar que el mensaje se muestra correctamente.

> [!TIP]
> **Desafío**
>
> Ahora que conseguimos ejecutar nuestro primer programa, debemos resolver el siguiente problema:
>
> **¿Qué necesitamos configurar en el archivo `package.json` para ejecutar nuestra aplicación utilizando únicamente el comando `npm start`?**
>
> Investigar el funcionamiento de los scripts de NPM, realizar los cambios necesarios y comprobar que la aplicación se ejecuta correctamente.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 2. Módulos, importaciones y exportaciones

### ¿Qué son los módulos en Node.js?

Un **módulo** es un archivo JavaScript que contiene código reutilizable y que puede ser utilizado desde otros archivos de nuestra aplicación.

La modularización nos permite:

- **Organizar:** dividir nuestra aplicación en archivos más pequeños.
- **Reutilizar:** utilizar funciones y constantes en diferentes partes del proyecto.
- **Mantener:** facilitar la lectura, modificación y mantenimiento del código.

Node.js soporta dos sistemas principales de módulos:

| Sistema                      | Importar    | Exportar         | Observaciones                             |
| ---------------------------- | ----------- | ---------------- | ----------------------------------------- |
| **CommonJS**                 | `require()` | `module.exports` | El sistema que utilizaremos en esta clase |
| **ECMAScript Modules (ESM)** | `import`    | `export`         | Requiere habilitar ESM en el proyecto     |

### CommonJS: module.exports y require()

**`module.exports` — Exportar**

La propiedad `module.exports` permite exponer valores desde un archivo JavaScript para que puedan ser utilizados en otro módulo.

**`require()` — Importar**

La función `require()` permite cargar un módulo y acceder al valor que este exporta mediante `module.exports`.

#### Ejemplo práctico

Supongamos que tenemos un archivo llamado `math.js` que contiene una función para sumar dos números.

**Estructura del proyecto:**

```text
src/
├── app.js
└── math.js
```

**Archivo: `math.js`**

```javascript
const sum = (a, b) => a + b;

module.exports = sum;
```

**Archivo: `app.js`**

```javascript
const sum = require("./math");

const result = sum(10, 5);

console.log(result);
```

**Resultado esperado:**

```text
15
```

En este ejemplo:

- `module.exports` exporta la función `sum`.
- `require('./math')` importa la función desde el archivo `math.js`.
- `app.js` utiliza la función importada para realizar una operación.

> [!NOTE]
> El ejemplo utiliza **CommonJS**, por lo que el proyecto no debe configurar `"type": "module"` en `package.json`.

### Tarea 004: Importación y exportación de módulos en Node.js

> [!IMPORTANT]
> **Objetivo**
>
> Aprender a organizar nuestro código en módulos reutilizables, exportando una variable que contiene la fecha y hora actual e importándola desde nuestra aplicación principal mediante CommonJS.

#### Procedimiento

**1. Crear el directorio de utilidades**

Dentro de la carpeta `src`, crear un nuevo directorio llamado `utils`.

**2. Crear el archivo de constantes**

Dentro de `utils`, crear un archivo llamado `constants.js`.

La estructura del proyecto deberá quedar de la siguiente manera:

```text
clase-02-bases/
├── src/
│   ├── utils/
│   │   └── constants.js
│   └── app.js
└── package.json
```

**3. Declarar y exportar una variable**

Dentro de `constants.js`, agregar el siguiente código:

```javascript
const CURRENT_DATE = new Date().toLocaleString();

module.exports = CURRENT_DATE;
```

En este ejemplo utilizamos el objeto `Date` de JavaScript para obtener la fecha y hora actuales y el método `toLocaleString()` para convertirlas en una cadena de texto (_String_).

**4. Preparar la aplicación**

Abrir el archivo `app.js` y eliminar el mensaje utilizado en la tarea anterior.

> [!TIP]
> **Desafío 1**
>
> Ahora que tenemos una variable exportada desde `utils/constants.js`, necesitamos utilizarla en nuestra aplicación principal.
>
> **¿Cómo podemos importar `CURRENT_DATE` desde `constants.js` y mostrar la fecha y hora actual en la terminal utilizando `console.log()`?**
>
> Investigar cómo funciona `require()`, identificar la ruta correcta del módulo y realizar la importación correspondiente.

Ejecutar la aplicación utilizando:

```bash
npm start
```

**Resultado esperado:**

```text
27/10/2026, 18:30:45
```

> [!TIP]
> **Desafío 2**
>
> **¿Qué necesitamos modificar en nuestro proyecto Node.js para utilizar `import` y `export` en lugar de `require()` y `module.exports`?**
>
> Investigar y realizar los cambios necesarios para:
>
> 1. Configurar el proyecto para utilizar ECMAScript Modules (ESM).
> 2. Exportar la constante `CURRENT_DATE` utilizando `export`.
> 3. Importar la constante desde `app.js` utilizando `import`.
> 4. Ejecutar la aplicación mediante `npm start` y comprobar que se muestra correctamente la fecha y hora en la terminal.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 3. Node_modules, dependencias de producción y desarrollo

### ¿Qué son las dependencias?

Las dependencias son paquetes o librerías externas que incorporamos a nuestro proyecto para utilizar funcionalidades desarrolladas por otros programadores, evitando tener que implementarlas desde cero.

En Node.js utilizamos **NPM (Node Package Manager)** para instalar, actualizar y administrar estas dependencias.

Los paquetes instalados se registran en el archivo `package.json` y normalmente se almacenan dentro del directorio `node_modules`.

### Tipos de dependencias

| Tipo           | Propiedad en `package.json` | ¿Cuándo se usa?                          | Instalación              |
| -------------- | --------------------------- | ---------------------------------------- | ------------------------ |
| **Producción** | `dependencies`              | La aplicación la necesita para funcionar | `npm install axios`      |
| **Desarrollo** | `devDependencies`           | Solo durante el proceso de desarrollo    | `npm install -D nodemon` |

#### Dependencias de producción

Son aquellas que nuestra aplicación necesita para funcionar durante su ejecución.

Por ejemplo, **Axios** es una librería que permite realizar peticiones HTTP a servicios externos y APIs.

Para instalar Axios, ejecutamos:

```bash
npm install axios
```

Por defecto, NPM registra el paquete dentro de la propiedad `dependencies` de nuestro `package.json`.

#### Dependencias de desarrollo

Son herramientas utilizadas principalmente durante el proceso de desarrollo, pero que no son necesarias para ejecutar nuestra aplicación en producción.

Por ejemplo, **Nodemon** es una herramienta que monitorea los cambios realizados en nuestros archivos y reinicia automáticamente la aplicación Node.js durante el desarrollo.

Para instalar Nodemon, ejecutamos:

```bash
npm install --save-dev nodemon
```

También podemos utilizar su forma abreviada:

```bash
npm install -D nodemon
```

NPM registra este paquete dentro de la propiedad `devDependencies`.

### Nuestro archivo package.json

Después de instalar ambas dependencias, nuestro archivo `package.json` tendrá una estructura similar a la siguiente:

```json
{
  "name": "clase-02-bases",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "axios": "^1.x.x"
  },
  "devDependencies": {
    "nodemon": "^3.x.x"
  }
}
```

> [!NOTE]
> Las versiones son ilustrativas. NPM registrará las versiones correspondientes a los paquetes instalados.

Observemos que incorporamos dos scripts:

| Script        | Qué ejecuta                                                         |
| ------------- | ------------------------------------------------------------------- |
| `npm start`   | Ejecuta nuestra aplicación utilizando Node.js                       |
| `npm run dev` | Ejecuta la aplicación con Nodemon y la reinicia al detectar cambios |

### ¿Por qué es importante diferenciarlas?

Separar las dependencias permite identificar qué paquetes necesita nuestra aplicación para funcionar y cuáles se utilizan únicamente durante el desarrollo.

En un entorno de producción, podemos instalar solamente las dependencias necesarias mediante:

```bash
npm ci --omit=dev
```

> [!TIP]
> Este comando utiliza el archivo `package-lock.json` para instalar las dependencias de forma reproducible, omitiendo las dependencias exclusivas de desarrollo.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 4. Reforzamiento de JavaScript

Conceptos fundamentales de JavaScript que necesitamos dominar para desarrollar con Node.js.

### 4.1 Functions

#### ¿Qué es una función?

Una **función** es un bloque de código reutilizable que permite realizar una tarea específica.

Las funciones nos permiten:

- **Reutilizar código:** evitar escribir las mismas instrucciones varias veces.
- **Organizar:** dividir problemas complejos en tareas más pequeñas.
- **Mantener:** facilitar la lectura y modificación del código.
- **Abstraer:** ocultar detalles de implementación detrás de un nombre descriptivo.

**Ejemplo básico**

```javascript
function greet() {
  console.log("Hello, World!");
}

greet();
```

**Resultado:**

```text
Hello, World!
```

La función `greet()` se ejecuta cuando la invocamos utilizando paréntesis `()`.

#### Declaración de funciones

Es la forma tradicional de definir funciones en JavaScript.

```javascript
function sum(a, b) {
  return a + b;
}

const result = sum(10, 5);

console.log(result); // 15
```

JavaScript también permite asignar una función a una variable.

```javascript
const multiply = function (a, b) {
  return a * b;
};

console.log(multiply(5, 3)); // 15
```

#### Arrow Functions

Las **arrow functions** fueron introducidas en ES6 y permiten escribir funciones de manera más concisa.

Función tradicional:

```javascript
function subtract(a, b) {
  return a - b;
}
```

Utilizando arrow function:

```javascript
const subtract = (a, b) => a - b;

console.log(subtract(10, 5)); // 5
```

Cuando la función contiene una sola expresión, podemos omitir las llaves y utilizar un retorno implícito.

**Retornar un objeto**

```javascript
const createUser = (name, age) => ({
  name,
  age,
});

console.log(createUser("John", 25));
```

> [!WARNING]
> Las arrow functions no tienen su propio `this`, por lo que no siempre son intercambiables con las funciones tradicionales.

#### Parámetros y argumentos

Los **parámetros** son las variables que declaramos al definir una función.

Los **argumentos** son los valores que enviamos cuando la ejecutamos.

**Ejemplo**

```javascript
const greet = (name) => {
  return `Hello, ${name}!`;
};

console.log(greet("John"));
```

**Parámetros por defecto (Default Parameters)**

Podemos definir valores predeterminados para los parámetros.

```javascript
const greet = (name = "Guest") => {
  return `Hello, ${name}!`;
};

console.log(greet()); // Hello, Guest!
console.log(greet("Anna")); // Hello, Anna!
```

El valor predeterminado se utiliza cuando el argumento es `undefined` o no se proporciona.

#### Return — Retorno de valores

La palabra reservada `return` permite devolver un valor desde una función.

También finaliza inmediatamente su ejecución.

**Ejemplo**

```javascript
const calculatePrice = (price, tax) => {
  const total = price + price * tax;

  return total;
};

const result = calculatePrice(100, 0.21);

console.log(result); // 121
```

> [!NOTE]
> Si una función no contiene `return`, devuelve `undefined` de manera implícita.

#### Rest Parameters (...)

Los parámetros rest permiten recibir una cantidad variable de argumentos y agruparlos en un array.

**Ejemplo**

```javascript
const sum = (...numbers) => {
  return numbers.reduce((total, number) => total + number, 0);
};

console.log(sum(10, 20)); // 30
console.log(sum(10, 20, 30, 40)); // 100
```

En este ejemplo, `...numbers` agrupa los argumentos recibidos en un array.

#### Funciones puras (Pure Functions)

Una función pura es aquella que:

- Siempre devuelve el mismo resultado para los mismos argumentos.
- No modifica variables externas ni produce efectos secundarios observables.

**Ejemplo de función pura**

```javascript
const applyDiscount = (price, discount) => {
  return price - (price * discount) / 100;
};

console.log(applyDiscount(100, 10)); // 90
```

**Ejemplo de función con efecto secundario**

```javascript
let total = 100;

const applyDiscount = (discount) => {
  total = total - (total * discount) / 100;
};

applyDiscount(10);

console.log(total); // 90
```

En el segundo ejemplo, la función modifica una variable externa.

> [!TIP]
> Cuando sea posible, preferir funciones puras porque facilitan las pruebas, el mantenimiento y la reutilización del código.

#### Scope — Alcance de las variables

El **scope** determina desde qué partes del código podemos acceder a una variable.

**Ejemplo**

```javascript
const APP_NAME = "Crypto App";

const showApp = () => {
  const message = "Welcome!";

  console.log(APP_NAME);
  console.log(message);
};

showApp();
```

La variable `APP_NAME` pertenece al ámbito exterior, mientras que `message` está declarada dentro de la función.

Por lo tanto, `message` no está disponible fuera de `showApp()`.

#### Funciones asíncronas (Async Functions)

Las funciones asíncronas permiten trabajar con operaciones que necesitan esperar un resultado, como consultas a APIs o bases de datos.

Se declaran utilizando `async` y pueden utilizar `await`.

**Ejemplo**

```javascript
const getUser = async () => {
  return {
    id: 1,
    name: "John",
  };
};

const showUser = async () => {
  const user = await getUser();

  console.log(user.name);
};

showUser();
```

> [!NOTE]
> Una función declarada con `async` siempre devuelve una Promise, incluso cuando retorna un valor directamente.

#### Buenas prácticas

Al desarrollar funciones en JavaScript, es recomendable seguir algunos principios de Clean Code:

- Utilizar nombres descriptivos que indiquen qué hace la función.
- Procurar que cada función tenga una responsabilidad clara.
- Evitar funciones excesivamente largas.
- Reducir la cantidad de parámetros cuando sea posible.
- Evitar modificar variables globales.
- Preferir funciones puras cuando resulte apropiado.
- Utilizar `return` para comunicar resultados en lugar de depender de `console.log()`.

**Ejemplo**

Evitar nombres poco descriptivos:

```javascript
const calc = (a, b) => a * b;
```

Preferir nombres que expresen la intención:

```javascript
const calculateTotalPrice = (price, quantity) => {
  return price * quantity;
};
```

<sub>[⬆ Volver al índice](#contenido)</sub>

### 4.2 Callbacks

#### ¿Qué es un callback?

Un **callback** es una función que se pasa como argumento a otra función para que esta pueda ejecutarla en un momento determinado.

En JavaScript, las funciones son consideradas **ciudadanos de primera clase (First-Class Functions)**, lo que significa que podemos almacenarlas en variables, pasarlas como argumentos y retornarlas desde otras funciones.

**Ejemplo**

```javascript
const greet = (name, callback) => {
  console.log(`Hello, ${name}!`);

  callback();
};

const sayGoodbye = () => {
  console.log("Goodbye!");
};

greet("John", sayGoodbye);
```

**Resultado esperado:**

```text
Hello, John!
Goodbye!
```

En este ejemplo:

- `greet()` recibe dos parámetros: `name` y `callback`.
- `sayGoodbye` se pasa como argumento sin ejecutarse inmediatamente.
- `callback()` ejecuta la función recibida.

> [!WARNING]
> Cuando pasamos una función como callback, utilizamos su nombre sin paréntesis: `sayGoodbye`. Si escribimos `sayGoodbye()`, estaríamos ejecutándola inmediatamente y pasando su resultado.

#### Callbacks síncronos (Synchronous Callbacks)

Un callback síncrono se ejecuta durante la ejecución de la función que lo recibe, sin esperar una operación asíncrona.

**Ejemplo**

```javascript
const calculate = (a, b, callback) => {
  return callback(a, b);
};

const sum = (a, b) => a + b;
const multiply = (a, b) => a * b;

console.log(calculate(10, 5, sum)); // 15
console.log(calculate(10, 5, multiply)); // 50
```

La función `calculate()` no necesita conocer qué operación matemática debe realizar. Simplemente ejecuta la función recibida.

Este mecanismo permite separar responsabilidades y reutilizar código.

#### Callbacks con métodos de arrays

Ya utilizamos callbacks al trabajar con métodos como `map()`, `filter()` y `forEach()`.

```javascript
const prices = [100, 200, 300];

const updatedPrices = prices.map((price) => price * 2);

console.log(updatedPrices); // [200, 400, 600]
```

La arrow function `(price) => price * 2` es el callback que `map()` ejecuta por cada elemento del array.

#### Callbacks asíncronos (Asynchronous Callbacks)

Un callback asíncrono es una función que se ejecuta después de que se completa una operación o cuando ocurre un evento.

En Node.js, los callbacks se utilizan para trabajar con operaciones como:

- Lectura y escritura de archivos.
- Eventos.
- Temporizadores.
- Operaciones de entrada y salida (I/O).

**Ejemplo con `setTimeout()`**

```javascript
console.log("Starting application...");

setTimeout(() => {
  console.log("Task completed!");
}, 2000);

console.log("Application continues...");
```

**Resultado esperado:**

```text
Starting application...
Application continues...
Task completed!
```

**¿Qué está sucediendo?**

1. JavaScript ejecuta el primer `console.log()`.
2. `setTimeout()` programa la ejecución de un callback.
3. El programa continúa ejecutando las siguientes instrucciones.
4. Después de aproximadamente 2 segundos, el callback se ejecuta cuando el entorno de ejecución puede procesarlo.

> [!IMPORTANT]
> `setTimeout()` no detiene la ejecución del programa y el tiempo indicado representa una espera mínima aproximada, no un momento exacto garantizado.

<sub>[⬆ Volver al índice](#contenido)</sub>

### 4.3 Factory Functions

Una **factory function** es una función que crea y devuelve objetos.

Nos permite generar múltiples objetos con una misma estructura sin necesidad de utilizar clases.

**Ejemplo**

```javascript
const createUser = (name, age) => ({
  name,
  age,
  greet() {
    return `Hello, my name is ${this.name}`;
  },
});

const user1 = createUser("John", 25);
const user2 = createUser("Anna", 30);

console.log(user1.greet());
console.log(user2.greet());
```

**Resultado esperado:**

```text
Hello, my name is John
Hello, my name is Anna
```

Las factory functions son útiles para crear objetos reutilizables y organizar la lógica de nuestra aplicación.

#### Tarea 005: Factory Functions para crear objetos persona

> [!IMPORTANT]
> **Objetivo**
>
> Implementar una Factory Function para crear objetos reutilizables, utilizando dependencias externas de NPM para generar identificadores únicos y calcular automáticamente la edad de una persona.

En este ejercicio vamos a crear una función llamada `createPerson()` que permita generar personas con la siguiente estructura:

```javascript
{
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  birthdate: '2000-05-15',
  age: 26
}
```

El identificador (`id`) y la edad (`age`) deberán generarse automáticamente, sin que sea necesario proporcionarlos como argumentos.

Utilizaremos dos librerías externas:

- [UUID — NPM](https://www.npmjs.com/package/uuid)
- [Get Age — NPM](https://www.npmjs.com/package/get-age)

**UUID:** permite generar identificadores únicos universales mediante UUID v4.

**Get Age:** permite calcular la edad en años cumplidos a partir de una fecha de nacimiento.

```bash
npm install uuid get-age
```

> [!NOTE]
> Estas dependencias deberán registrarse dentro de `dependencies` en nuestro archivo `package.json`.

**Estructura de archivos**

Dentro de `src`, crear un directorio llamado `factories` y un archivo llamado `person.factory.js`.

```text
clase-02-bases/
├── src/
│   ├── factories/
│   │   └── person.factory.js
│   └── app.js
├── package.json
└── package-lock.json
```

**Implementar la Factory Function**

Dentro de `person.factory.js`, implementar y exportar una función llamada `createPerson()`.

La función deberá:

1. Recibir únicamente dos parámetros: `name` y `birthdate`.
2. Generar automáticamente un identificador único utilizando `uuid`.
3. Calcular automáticamente la edad utilizando `get-age`.
4. Retornar un nuevo objeto con las propiedades `id`, `name`, `birthdate` y `age`.
5. Utilizar una Arrow Function y ECMAScript Modules (ESM).

> [!NOTE]
> La fecha de nacimiento deberá recibirse en formato `YYYY-MM-DD`, por ejemplo `2000-05-15`.

**Utilizar nuestra Factory Function**

Desde el archivo `app.js`:

1. Importar la función `createPerson()`.
2. Crear al menos tres personas con diferentes nombres y fechas de nacimiento.
3. Almacenar las personas dentro de un array.
4. Mostrar el array completo utilizando `console.log()`.

> [!TIP]
> **Desafío**
>
> ¿Cómo podemos crear múltiples objetos de personas utilizando una única Factory Function, generando automáticamente sus identificadores y edades mediante dependencias externas?
>
> Investigar cómo importar y utilizar las funciones proporcionadas por `uuid` y `get-age`.
>
> La implementación deberá permitir crear nuevas personas sin modificar la lógica de `createPerson()`.

<sub>[⬆ Volver al índice](#contenido)</sub>

> [!NOTE]
> El reforzamiento de JavaScript continúa en la **Clase 3** con Adapter Pattern, Promises, Async/Await, Objetos, Arrays y **Closures**.

---

## Referencias

- 📘 [Node.js — Modules: CommonJS](https://nodejs.org/api/modules.html)
- 📘 [Node.js — ECMAScript Modules](https://nodejs.org/api/esm.html)
- 📘 [npm — package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- 📘 [npm — Scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts)
- 📘 [npm — npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- 📗 [MDN — Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- 📗 [MDN — Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- 📗 [MDN — Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
- 🛠️ [uuid — NPM](https://www.npmjs.com/package/uuid) · [get-age — NPM](https://www.npmjs.com/package/get-age)

## Mentor

**Ariel Duarte** · Kopius · The Academy

<sub>[⬆ Volver al índice](#contenido)</sub>
