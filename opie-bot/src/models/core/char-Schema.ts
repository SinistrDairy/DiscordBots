import mongoose, { Schema } from 'mongoose'

const reqString = { type: String, required: true }
const uniqString = { type: String, required: true, unique: true }

const charSchema = new Schema({
    name: uniqString,
    image: uniqString,
    badGuy: uniqString,
    isChosen: {type: Boolean, default: false}
})

const name = 'dChars'

export default mongoose.models[name] || mongoose.model(name, charSchema)