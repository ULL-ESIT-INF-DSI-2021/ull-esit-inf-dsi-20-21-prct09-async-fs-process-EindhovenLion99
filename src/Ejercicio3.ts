const fs = require('fs');
import * as yargs from 'yargs';

function userWatcher(name: string) {
  let watching: boolean = false;
  let path: string = ""
  if (name.length > 0) {
    path = `/home/usuario/DSI/Pr08/src/database/${name}.json`
  } else {
    path = `/home/usuario/DSI/Pr08/src/database`
  }
  fs.watch(path, (eventType: any, filename: any) => {
    if (watching) return;
    watching = true;
    console.log("El tipo de evento es " + eventType);
    if (filename) {
      console.log(`Fichero: ${filename}`);
    } else {
      console.log('Fichero no encontrado');
    }
    setTimeout(() => {
      watching = false;
    }, 100);
  })
  console.log("Esperando cambios en algun fichero...");
}

yargs.command({
  command: 'user',
  describe: 'Usuario',
  builder: {
    name: {
      describe: 'Nombre del Usuario',
      demandOption: false,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.name === 'string') {
      userWatcher(argv.name);
    } else {
      userWatcher("");
    }
  },
});

yargs.parse();