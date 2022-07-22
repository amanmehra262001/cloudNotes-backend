const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");

// Route1: Get all notes using GET '/fetchnotes' Login required
router.get("/fetchnotes", fetchUser, async(req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

router.post(
    "/addnote",
    fetchUser, [
        body("title", "Please enter a valid title for the note").isLength({
            min: 3,
        }),
        body(
            "description",
            "Please enter a valid Description for the note"
        ).isLength({ min: 5 }),
    ],
    async(req, res) => {
        try {
            // If there are errors then return bad request and the error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tag } = req.body;
            const note = new Notes({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    }
);

router.put("/updatenote/:id", fetchUser, async(req, res) => {
    try {
        const { title, description, tag } = req.body;
        // Create a new note object
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // Find note by id and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (!note.user.toString() == req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(
            req.params.id, { $set: newNote }, { new: true }
        );
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

router.delete("/deletenote/:id", fetchUser, async(req, res) => {
    try {
        // Find note by id and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        // Allow only valid user to interact with the note
        if (!note.user.toString() == req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ Success: "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

module.exports = router;