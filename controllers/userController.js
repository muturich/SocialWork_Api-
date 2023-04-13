const { User, Thought } = require('../models');

const userController = {
  // get all users
  getAllUsers(req, res) {
    User.find({})
      .populate({
        path: 'thoughts',
        select: '-__v',
      })
      .populate({
        path: 'friends',
        select: '-__v',
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then((dbUserData) => {
        // Apply projection to only show _id fields in thoughts and friends arrays
        const users = dbUserData.map(user => {
          return {
            ...user.toObject(),
            thoughts: user.thoughts.map(({ _id }) => _id),
            friends: user.friends.map(({ _id }) => _id)
          };
        });
        res.json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },


  // get one user by id
  getUserById({ params }, res) {
    User.findOne({ _id: params.id })
      .populate({
        path: 'thoughts',
        select: '-__v',
      })
      .populate({
        path: 'friends',
        select: '-__v',
      })
      .select('-__v')
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // create user
  createUser({ body }, res) {
    User.create(body)
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => res.status(400).json(err));
  },

  // update user by id
  updateUser({ params, body }, res) {
    User.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => res.status(400).json(err));
  },

// delete user by id and remove associated thoughts and reactions
deleteUser({ params }, res) {
  let dbUserData;
  User.findOne({ _id: params.id })
    .then((userData) => {
      if (!userData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      dbUserData = userData;
      // remove all associated thoughts
      return Thought.deleteMany({ _id: { $in: dbUserData.thoughts } });
    })
    .then(() => {
      // remove all associated reactions
      return User.updateMany(
        { _id: { $in: dbUserData.friends } },
        { $pull: { friends: params.id } }
      );
    })
    .then(() => {
      // remove the user
      return User.findOneAndDelete({ _id: params.id });
    })
    .then((deletedUserData) => {
      if (!deletedUserData) {
        res.status(404).json({ message: 'No user found with this id!' });
        return;
      }
      res.json('User and associated thoughts and reactions deleted');
    })
    .catch((err) => res.status(400).json(err));
},


  // add a friend to user's friend list
    addFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $addToSet: { friends: params.friendId } },
            { new: true }
        )
            .then((dbUserData) => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id!' });
                    return;
                }
                res.json(dbUserData);
            }
            )
            .catch((err) => res.json(err));
    },

    // remove a friend from user's friend list
    deleteFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $pull: { friends: params.friendId } },
            { new: true }
        )
            .then((dbUserData) => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id!' });
                    return;
                }
                res.json("Friend deleted");
            }
            )
            .catch((err) => res.json(err));
    }
};

module.exports = userController;
