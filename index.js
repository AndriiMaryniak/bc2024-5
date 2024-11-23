const http = require('http');
const fs = require('fs').promises;
const { Command } = require('commander');
const path = require('path');
const express = require('express');

const program = new Command();

program
  .requiredOption('-h, --host <host>')
  .requiredOption('-p, --port <port>')
  .requiredOption('-c, --cache <path>');

program.parse();

const options = program.opts();

if (!options.host || !options.port || !options.cache) {
    console.error("Помилка: не задано всі обов'язкові параметри!");
    process.exit(1);
}

const app = express();

app.get('/', (req, res) => {
    res.send({ message: 'Hello WWW!' });
});

app.listen(options.port, options.host, () => {
    console.log(`Application listening `);
});
