const Thought = require('../models/Thought');
const User = require('../models/User');


const thoughtController = {
    // get all thoughts
    getAllThoughts(req, res) {
        Thought.find({})
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .select('-__v')
        .sort({ _id: -1 })
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },
    // get one thought by id
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .select('-__v')
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },
    // create thought
    createThought({ body }, res) {
        Thought.create(body)
          .then(dbThoughtData => {
            return User.findOneAndUpdate(
              { _id: body.userId },
              { $push: { thoughts: dbThoughtData._id } },
              { new: true }
            );
          })
          .then(dbUserData => {
            if (!dbUserData) {
              res.status(404).json({ message: 'No user found with this id!' });
              return;
            }
            res.json(dbUserData);
          })
          .catch(err => {
            console.log(err);
            res.status(400).json(err);
          });
      },
    // update thought by id
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.id },
            body,
            { new: true, runValidators: true }
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },
    // delete thought
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json('Thought Deleted!');
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },
// create a reaction
addReaction({ params, body }, res) {
    Thought.findByIdAndUpdate(
      { _id: params.thoughtId },
      { $push: { reactions: body } },
      { new: true, runValidators: true }
    )
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        res.json({ message: 'Reaction added!', dbThoughtData });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
    // delete reaction
    deleteReaction({ params }, res) {
        const { thoughtId, reactionId } = params;
        Thought.findByIdAndUpdate(
          thoughtId,
          { $pull: { reactions: { _id: reactionId } } },
          { new: true }
        )
          .then((updatedThought) => {
            if (!updatedThought) {
              return res.status(404).json({ message: 'No thought found with this id!' });
            }
            res.json({ message: 'Reaction deleted!', updatedThought });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json(err);
          });
      }
      
};

module.exports = thoughtController;


