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