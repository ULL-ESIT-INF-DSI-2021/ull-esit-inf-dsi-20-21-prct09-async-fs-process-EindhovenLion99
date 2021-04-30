# Informe Practica 9

## Introduccion

En esta practica vamos a hacer uso de la libreria ```fs```, ```spawn```, ```stream``` y otros para manejar ficheros e informacion de los mismos. Asi como lo que sucede en la call stack, API stack y Task Queue.

## Ejercicio 1

![Cap](Captura1.png)

* Ejecucion del programa

Como vemos, si ejecutamos el programa con un archivo que no existe, nos indica por pantalla que este no se encuentra. En caso contrario si este existiese, no imprime por pantalla que el programa esta empezando a observar el archivo, para observar modificaciones en el. Acto seguido imprime por pantalla que el archivo ya no esta siendo observado, lo explicaremos mas adelante. Mientras tanto, si modificamos el archivo, nos muestra dos veces por pantalla que el archivo ha sido modificado, si lo volvemos a modificar, nos vuelvea mostrar el mismo mensaje por segunda vez. Acabamos la ejecucion del programa al ingresar por teclado ```ctrl + C```

* Contenido de Pila y registro de eventos.

```ts
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
```

1. Lo que sucede primero es que se carga en la Call Stack la llamada a al programa, la funcion principal, que es anonima.

    | Call Stack |
    |------------|
    |```anonymous()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

2. Se cargan las librerias pertinentes y se comprueba que se han introducido los argumentos correctos. Nada mas sucede, todo sigue igual.

3. Luego entra entra en el else, y se declara la variable filename, que contine el nombre del fichero. Luego se llama a la funcion ```access()```, la cual se ejecuta a traves de la Web API, esta pasa a la pila de API:

    | Call Stack |
    |------------|
    |```anonymous()```|

    | API |
    |------------|
    |```access()```|


    | Task Queue |
    |------------|
    |-|

    La funcion access empieza a ejecutarse en otro hilo, y la funcion ```anonymous``` acababa,cuando ```access()``` termina la callback de la misma pasa a la cola de tareas:

    | Call Stack |
    |------------|
    |-|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |```cb()```|

4. Como la call stack ya esta vacia podemos ejecutar lo que esta en la cola de tareas, es decir la callback de la funcion ```access()```. En caso de que no haya ningun error, entra en el else, se imprime por pantalla `Starting to watch file ${filename}`, por lo tanto entraria la funcion ```console.log()``` en la call stack.

    | Call Stack |
    |------------|
    |```cb()```|
    |```console.log()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

    Una vez se hace el ```console.log()```, sale de la stack y se llama a la funcion ```watch()```, que su resultado se asigna a la variable ```watcher```.

    | Call Stack |
    |------------|
    |```cb()```|
    |```watch()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

    ***

    | Call Stack |
    |------------|
    |```cb()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

5. Tras todo esto se llama a la funcion ```watcher.on()```, la cual funciona a traves de la API, por lo tanto, esta pasa a la pila de API:

    | Call Stack |
    |------------|
    |```cb()```|

    | API |
    |------------|
    |```watcher.on()```|


    | Task Queue |
    |------------|
    |-|

    Tras esto se llama nuevamente a la funcion ```console.log()```, mientras se ejecuta en otro hilo la funcion ```watcher.on()```.

    | Call Stack |
    |------------|
    |```cb()```|
    |```console.log()```|

    | API |
    |------------|
    |```watcher.on()```|


    | Task Queue |
    |------------|
    |-|

    Se ejecuta la funcion console.log() y sale de la call stack.

    Hay que recordar que en la call stack sigue la callback de la funcion ```access()```, pero esta ya termina aqui. La call stack quedaria vacia, y en cuanto acabe la funcion watcher.on() en la pila API pasara a la cola de tareas, y como la call stack estara vacia en ese momento pasara a ejecutarse.

    | Call Stack |
    |------------|
    |-|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |```cb()```|

    La ```cb()``` nueva es de la funcion ```watcher.on()```.

6. Como mencionamos antes, la call stack esta vacia por lo que se ejecuta la callback

    | Call Stack |
    |------------|
    |```cb()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

    Esta, llama a console.log(), en caso de que, por supuesto, se modifique el archivo, en caso de que no se modifique, la callback no se ejecutara.

    | Call Stack |
    |------------|
    |```cb()```|
    |```console.log()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

    Se ejecuta el console.log() en caso de modificacion, pero la cb() nunca acaba, a no ser que se pare el proceso.

    | Call Stack |
    |------------|
    |```cb()```|

    | API |
    |------------|
    |-|


    | Task Queue |
    |------------|
    |-|

* ¿Qué hace la función access?

La funcion ```access()``` se encarga de comprobar que el usuario tiene los permisos para acceder al archivo que se le pasa por parametro. Sin embargo, se le pasa como parametro tambien ```constants.F_OK```, por lo tanto ahora, la funcion access nos dice solamente si el fichero existe en el path que le hemos pasado como primer parametro.

* ¿Para qué sirve el objeto constants?

Son objetos que se usan en la funcion access, tenemos diferentes tipos:

    F_OK: Nos dice si existe el path.
    R_OK: Nos dice si tenemos permisos de lectura del path.
    W_OK: Nos dice si tenemos permisos de escritura del path.
    X_OK: Nos dice si tenemos permisos de ejecucuion del path.


## Ejercicio 2

Para realizar este ejercicio, que es obtener información sobre el número de líneas, palabras o caracteres que contiene un fichero de texto, se hizo uso de ```fs```, ya sea con ```pipe``` o sin ella.

Haciendo uso de yargs controlabamos los parametros que se pasan por linea de comandos, por ejemplo:

```bash
node dist/Ejercicio2.ts chars --file="helloworld.txt"
```

```chars``` para los caracteres, ```lines``` para el numero de lineas y ```words``` para el numero de palabras.

Se tiene dos funciones para el calculo de palabras, una para el calculo sin pipe y otra con pipe, lo mismo sucede para el calculo de caracteres y lineas.

```ts
function fileWordCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wc = spawn('wc', ['-w', filename]);
        let wcOutput = '';
        wc.stdout.on('data', (piece) => wcOutput += piece);
        wc.on('close', () => {
          const wcOutputArray = wcOutput.split(/\s+/);
          console.log("El fichero " + filename + " tiene " + wcOutputArray[0] + " palabras");
        })
      }
    });
  }
}
```

A la funcion le pasamos por parametro el nombre del fichero, comprobamos que existe el fichero con ```access()```, una vez comprobamos que el fichero exista ejecutamos la funcion spawn(), que genera un proceso hijo, en este caso el proceso wc -w (word count pero con la opcion -w para el numero de palabras), luego añadimos los datos que genera ese proceso en a wcOutput gracias a la funcion ```wc.stdout.on('data')```, siendo wc el nombre de la variable que genera ese proceso hijo. Luego, con la funcion ```.on('close')``` mostramos el resultado del proceso, sin embargo, el proceso muesta la cantidad de caracteres, palabras y lineas de un fichero, pero en este caso solo nos interesa el numero de palabras, por eso accedemos a la primera posicion de wcOutput.

Para hacer uso de pipe hacemos algo muy parecido, el spawn como en la funcion anterior, y luego hacer el pipe, que nos muestra la ejecucion del proceso.

```ts
function pipeWordCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wcw = spawn('wc', ['-w', filename]);
        wcw.stdout.pipe(process.stdout);
      }
    });
  }
}
```

De la misma forma se realizarian las demas funciones.

## Ejercicio 3

En este ejercicio se pretende crear un watcher, cuya tarea es observar la base de datos de notas de la practica anterior. Con el uso de yargs pasamos el argumento user, para observar el fichero de notas de un usuario concreto.

```bash
node dist/Ejercicio3.ts user
node dist/Ejercicio3.ts user --name="Juan"
```

Si ponemos solo user nos muestra los cambios en la base de datos entera, en cambio si ponemos nombre nos muestra los cambios del fichero del usuario especificado.

```ts
function userWatcher(name: string) {
  let path: string = ""
  if (name.length > 0) {
    path = `/home/usuario/DSI/Pr08/src/database/${name}.json`
  } else {
    path = `/home/usuario/DSI/Pr08/src/database`
  }
  fs.watch(path, (eventType: any, filename: any) => {
    console.log("El tipo de evento es " + eventType);
    if (filename) {
      console.log(`Fichero: ${filename}`);
    } else {
      console.log('Fichero no encontrado');
    }
  })
  console.log("Esperando cambios en algun fichero...");
}
```

Le pasamos a la funcion el nombre del usuario, en caso de no especificar usuario mandamos una cadena vacia. Dependiendo de lo anterior usara un path concreto, luego hacemos uso de la funcion ```fs.watch()```, que observa la ruta especificada a la espera de cambios. Si ocurre un cambio imprimimos por pantalla el fichero que ha cambiado asi como el tipo de cambio que se ha realizado.

## Ejercicio 4

Como en los ejercicios anteriores hacemos uso de yargs, por ejemplo:

```bash
node dist/Ejercicio4.ts what --path"path_to_file"
```

Este ejemplo nos dice si el path es un directorio o un fichero. Para saber si es un directorio o funcion hacemos uso de la funcion ```what()```.

```ts
function what(path: string): boolean {
  const what = spawn('ls', ['-l', path]);
  let whatOutput = '';
  let isDir: boolean = false;
  what.stdout.on('data', (piece) => whatOutput += piece);
  what.on('close', () => {
    if (whatOutput[0][0] === '-') {
      console.log("El path " + path + " es un fichero");
    } else {
      console.log("El path " + path + " es un directorio");
      isDir = true;
      return isDir;
    }
  })
}
```

Hacemos uso de la funcion spawn, que ejecuta el proceso ls -l, en el resultado de dicho comando se muestra lo que queremos saber, si el path es un fichero o un directorio. Aprovechamos una variable booleana que retorna true si es una directorio o false si es un fichero.

El resto de operaciones las incluimos directamente en el handler de yargs, para crear directorios:

```ts
yargs.command({
  command: 'mkdir',
  describe: 'Crear un directorio',
  builder: {
    path: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === 'string') {
      let path: string = argv.path;
      if (path === undefined) {
        console.log('Please, specify a path');
      } else {
        const mkdir = spawn('mkdir', [path]);
        console.log("Se ha creado el directorio " + path);
      }
    }
  },
});
```

Nuevamente hacemos uso de spawn, en este caso de mkdir, para crear un nuevo directorio con el path que se necesita.

```ts
yargs.command({
  command: 'list',
  describe: 'Lista los ficheros de un directorio',
  builder: {
    path: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === 'string') {
      let path: string = argv.path;
      if (path === undefined) {
        console.log('Please, specify a path');
      } else {
        access(path, constants.F_OK, (err) => {
          if (err) {
            console.log(`Path ${path} does not exist`);
          } else {
            const list = spawn('ls', ['-l', path]);
            list.stdout.pipe(process.stdout);
          }
        });
      }
    }
  },
});
```

Para listar el directorio hacemos lo mismo con la funcion spawn pero con ls, y al resultado de la funcion spawn lo mostramos por pantalla gracias al pipe.

```ts
yargs.command({
  command: 'cat',
  describe: 'Lista el contenido de un fichero',
  builder: {
    file: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.file === 'string') {
      let file: string = argv.file;
      if (file === undefined) {
        console.log('Please, specify a file');
      } else {
        access(file, constants.F_OK, (err) => {
          if (err) {
            console.log(`Path ${file} does not exist`);
          } else {
            const cat = spawn('cat', [file]);
            cat.stdout.pipe(process.stdout);
          }
        });
      }
    }
  },
});
```

Para imprimir el contenido de un fichero hacemos uso del spawn del proceso cat, el resultado de ese proceso lo mostramos por pantalla con pipe.

```ts
yargs.command({
  command: 'mv',
  describe: 'Mueve un fichero a un directorio o directorio a un directorio',
  builder: {
    path: {
      describe: 'Path',
      demandOption: true,
      type: 'string',
    },
    path2: {
      describe: 'Path2',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === 'string' && typeof argv.path2 === 'string') {
      let path: string = argv.path;
      let path2: string = argv.path2;
      if (path === undefined && path2 === undefined) {
        console.log('Please, specify the paths');
      } else {
        access(path, constants.F_OK, (err) => {
          if (err) {
            console.log(`Path ${path} does not exist`);
          } else {
            access(path2, constants.F_OK, (err) => {
              if (err) {
                console.log(`Path ${path2} does not exist`);
              } else {
                if (what(path) && !what(path2)) {
                  console.log("No se puede realizar esa accion");
                } else {
                  let mv = spawn('mv', [path, path2])
                  console.log(path + " movido a " + path2);
                }
              }
            });
          }
        });
      }
    }
  },
});
```

Para hacer el mv priemero tenemos que comprobar que si la priemra ruta es un directorio y la segunda un fichero, no se puede realizar la accion. En caso contrario se realiza.

```ts
yargs.command({
  command: 'cp',
  describe: 'Copia un fichero a un directorio o directorio a un directorio',
  builder: {
    path: {
      describe: 'Path',
      demandOption: true,
      type: 'string',
    },
    path2: {
      describe: 'Path2',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === 'string' && typeof argv.path2 === 'string') {
      let path: string = argv.path;
      let path2: string = argv.path2;
      if (path === undefined && path2 === undefined) {
        console.log('Please, specify the paths');
      } else {
        access(path, constants.F_OK, (err) => {
          if (err) {
            console.log(`Path ${path} does not exist`);
          } else {
            access(path2, constants.F_OK, (err) => {
              if (err) {
                console.log(`Path ${path2} does not exist`);
              } else {
                if (what(path) && !what(path2)) {
                  console.log("No se puede realizar esa accion");
                } else {
                  let mv = spawn('cp', ['-r', path, path2])
                  console.log(path + " copiado a " + path2);
                }
              }
            });
          }
        });
      }
    }
  },
});
```

Para cp, es exactamente como el ejercicio anterior, si la priemra ruta es un directorio y la segunda un fichero, no se puede realizar la accion.

```ts
yargs.command({
  command: 'rm',
  describe: 'Boora un directorio o fichero',
  builder: {
    path: {
      describe: 'Path',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === 'string') {
      let path: string = argv.path;
      if (path === undefined) {
        console.log('Please, specify a path');
      } else {
        access(path, constants.F_OK, (err) => {
          if (err) {
            console.log(`Path ${path} does not exist`);
          } else {
            const rm = spawn('rm', ['-rf', path]);
            console.log(path + " eliminado");
          }
        });
      }
    }
  },
});
```

En caso de rm, para eliminar una ruta hacemos el spawn de rm con las opciones -rf para elimianar un fichero o un directorio.