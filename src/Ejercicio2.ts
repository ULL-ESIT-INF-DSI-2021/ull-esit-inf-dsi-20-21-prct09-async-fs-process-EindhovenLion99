import {access, constants, watch} from 'fs';
const readline = require('readline');
const fs = require('fs');
import {spawn} from 'child_process'
import * as yargs from 'yargs';

function fileLineCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wc = spawn('wc', ['-l', filename]);
        let wcOutput = '';
        wc.stdout.on('data', (piece) => wcOutput += piece);
        wc.on('close', () => {
          const wcOutputArray = wcOutput.split(/\s+/);
          console.log("El fichero " + filename + " tiene " + wcOutputArray[0] + " lineas");
        })
      }
    });
  }
}

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


function fileCharCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wc = spawn('wc', ['-c', filename]);
        let wcOutput = '';
        wc.stdout.on('data', (piece) => wcOutput += piece);
        wc.on('close', () => {
          const wcOutputArray = wcOutput.split(/\s+/);
          console.log("El fichero " + filename + " tiene " + wcOutputArray[0] + " caracteres");
        })
      }
    });
  }
}

function pipeLineCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wcl = spawn('wc', ['-l', filename]);
        wcl.stdout.pipe(process.stdout);
      }
    });
  }
}

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

function pipeCharCounter(filename: string) {
  if (filename === undefined) {
    console.log('Please, specify a file');
  } else {
    access(filename, constants.F_OK, (err) => {
      if (err) {
        console.log(`File ${filename} does not exist`);
      } else {
        const wcc = spawn('wc', ['-c', filename]);
        wcc.stdout.pipe(process.stdout);
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
      fileLineCounter(argv.file);
      pipeLineCounter(argv.file);
    }
  },
});

yargs.command({
  command: 'words',
  describe: 'Numero de palabras',
  builder: {
    file: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.file === 'string') {
      fileWordCounter(argv.file);
      pipeWordCounter(argv.file);
    }
  },
});


yargs.command({
  command: 'chars',
  describe: 'Numero de caracteres',
  builder: {
    file: {
      describe: 'Archivo',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.file === 'string') {
      fileCharCounter(argv.file);
      pipeCharCounter(argv.file);
    }
  },
});

yargs.parse();