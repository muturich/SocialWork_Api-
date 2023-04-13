const { Schema, model } = require('mongoose');
// added reaction schema and removed reaction model reaction.js
const ReactionSchema = new Schema({
  reactionBody: {
    type: String,
    required: true,
    maxLength: 280,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: function (timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
});

const ThoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 280,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: function (timestamp) {
        return new Date(timestamp).toLocaleString();
      },
    },
    username: {
      type: String,
      required: true,
    },
    reactions: [ReactionSchema],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);

// get total count of reactions on retrieval
ThoughtSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

// format the timestamp on retrieval
const dateFormat = (timestamp) => {
  return new Date(timestamp).toISOString();
};

const Thought = model('Thought', ThoughtSchema);

module.exports = Thought;
