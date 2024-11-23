const http = require('http');
const fs = require('fs');
const { Command } = require('commander');
const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')

const program = new Command();

program
  .requiredOption('-h, --host <host>')
  .requiredOption('-p, --port <port>')
  .requiredOption('-c, --cache <path>');

program.parse();

const options = program.opts();

const app = express();

const upload = multer();

const notespapka = path.resolve(options.cache);

if (!options.host || !options.port || !options.cache) {
    console.error("not all parameters are set!");
    process.exit(1);
}

app.use(express.text());


function fileExists(filePath) {
    return fs.existsSync(filePath);
}

function getNotesList() {
    const notesList = [];
    const files = fs.readdirSync(notespapka);

    files.forEach(file => {
        const filePath = path.join(notespapka, file);
        const extname = path.extname(file);

        if (extname === '.txt') {
            const name = path.basename(file, extname); 
            const text = fs.readFileSync(filePath, 'utf8'); 
            notesList.push({
                name: name,
                text: text
            });
        }
    });

    return notesList;
}

app.get('/notes/:name', (req, res) => {
    const name = req.params.name;
    const filePath = path.join(notespapka, `${name}.txt`); 
    
    if (fileExists(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('file isnt found');
    }
});

app.put('/notes/:name', (req, res) => {
    const name = req.params.name; 
    const newText = req.body; 

    if (!newText || typeof newText !== 'string') {
        return res.status(400).send('no text.');
    }

    const filePath = path.join(notespapka, `${name}.txt`); 

    if (!fileExists(filePath)) {
        return res.status(404).send('note is not found.');
    }

    fs.writeFile(filePath, newText, (err) => {
        if (err) {
            return res.status(500).send('error updating.');
        }
        res.status(200).send('notes is updated.');
    });
});


app.delete('/notes/:name', (req, res) => {
    const name = req.params.name;
    const filePath = path.join(notespapka, `${name}.txt`); 
    
    if (fileExists(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).send('error deleting file');
            }
            res.status(200).send('note is deleted');
        });
    } else {
        res.status(404).send('file is not found');
    }
});


app.post('/write', upload.fields([{ name: 'note_name', maxCount: 1 }, { name: 'note', maxCount: 1 }]), (req, res) => {
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    if (!noteName || !noteText) {
        return res.status(400).send('name or text is not set');
    }

    const filePath = path.join(notespapka, `${noteName}.txt`); 

    if (fileExists(filePath)) {
        return res.status(400).send('note does not exist');
    }

    fs.writeFile(filePath, noteText, (err) => {
        if (err) {
            return res.status(500).send('error creating');
        }
        res.status(201).send('note is created');
    });
});

app.get('/UploadForm.html', (req, res) => {
    const formPath = path.join(__dirname, 'UploadForm.html'); 
    fs.readFile(formPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('error uploading');
        }
        res.send(data); 
    });
});

app.get('/notes', (req, res) => {
    const notes = getNotesList();
    res.status(200).json(notes); 
});

app.listen(options.port, options.host, () => {
    console.log(`Application listening on ${options.host}:${options.port}`);
});
