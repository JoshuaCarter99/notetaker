// Require modules
const express = require("express");
const db = require("./db/db.json");
const fs = require("fs");
const path = require("path");
const util = require("util");
const {v4: uuidv4} = require("uuid");


const readFromFile = util.promisify(fs.readFile);

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware!
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// HTML route
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

// API route
app.get("/api/notes", (req, res) => {
    console.info(`${req.method} /api/notes`);
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));   
});

app.post("/api/notes", (req, res) => {
    console.info(`${req.method} request received to save a new note`);

    const {title, text} = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4()
        };

        // Reading db/db.json
        fs.readFile("./db/db.json", "utf8", (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).json("Error reading db.json file");
            } else {
                console.log(data);

                const notesList = JSON.parse(data);
                notesList.push(newNote);

                fs.writeFile("./db/db.json", JSON.stringify(notesList, null, "\t"), (err) =>
                    err ? console.error(err) : console.log(`Note ${newNote.id} has been written to db.json file`)
                );
            }
        });

        const response = {
            status: "success",
            body: newNote
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json("Error in posting note");
    }
});

// Delete note function
app.delete("/api/notes/:id", (req, res) => {
    if (req.params.id) {
        console.info(`${req.method} request received to delete a note`);
        const deleteNoteID = req.params.id;

        
        readFromFile("./db/db.json", "utf8", (err, data) => {
            if (err) {
                console.log(err);
                res.status(400).json("Error reading file");
            } else {
                console.log(data);
                const notesList = JSON.parse(data);

                for (let i = 0; i < notesList.length; i++) {
                    if (notesList[i].id === deleteNoteID) {
                        notesList.splice(i, 1);

                        fs.writeFile("./db/db.json", JSON.stringify(notesList, null, "\t"), (err) =>
                            err ? console.error(err) : res.status(200).json(`Note ${deleteNoteID} has been deleted from db.json file`)
                        );

                        return;
                    }
                }

            }
        });
    } else {
        res.status(500).json("Error in deleting note. Note ID not provided");
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start server
app.listen(PORT, () => 
    console.log(`App listening to http://localhost:${PORT}`)
);