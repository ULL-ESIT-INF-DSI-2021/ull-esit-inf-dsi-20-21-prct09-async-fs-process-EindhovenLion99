import {access, constants, watch} from 'fs';
import * as yargs from 'yargs';

function fileCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        console.log(`Starting to watch file ${filename}`);
        const watcher = watch(filename);
        watcher.on('change', () => {
          console.log(`File ${filename} has been modified somehow`);
        });
        console.log(`File ${filename} is no longer watched`);
      }
    });
  }
}

yargs.command({
  command: 'lines',
  describe: 'Numero de Lineas',
  builder: {
    file: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.file === 'string') {
      console.log(argv.file);
      fileCounter(argv.file);
    }
  },
});

yargs.parse();