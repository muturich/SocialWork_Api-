const mongoose = require('mongoose');
const { User, Thought, Reaction } = require('../models');

mongoose.connect('mongodb://127.0.0.1:27017/socialnetworkDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userData = [
  {
    username: 'user1',
    email: 'user1@example.com',
    thoughts: [],
    friends: []
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    thoughts: [],
    friends: []
  }
];



const seedDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    const users = await User.insertMany(userData);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();