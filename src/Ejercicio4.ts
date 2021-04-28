import {access, constants, watch} from 'fs';
const readline = require('readline');
const fs = require('fs');
import {spawn} from 'child_process'
import * as yargs from 'yargs';

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
    }
  })
  return isDir;
}

yargs.command({
  command: 'what',
  describe: 'Indica si es un directorio o un fichero',
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
           what(path);
          }
        });
      }
    }
  },
});

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


yargs.parse();