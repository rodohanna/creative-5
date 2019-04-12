const mongoose = require("mongoose");
const express = require("express");
const users = require("./users");
const auth = require("./auth");
const router = express.Router();

const User = users.model;

const blogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  slug: String,
  title: String,
  delta: Object,
  html: String,
  createdAt: Date
});

blogSchema.virtual("id").get(function() {
  return this._id.toHexString();
});

blogSchema.set("toJSON", {
  virtuals: true
});

const Blog = mongoose.model("Blog", blogSchema);

router.get("/", auth.verifyToken, User.verify, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user });
    res.send(blogs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.put("/", auth.verifyToken, User.verify, async (req, res) => {
  const { id, title, delta, html } = req.body;
  try {
    const blog = await Blog.findOne({ _id: id });
    blog.title = title;
    blog.delta = delta;
    blog.html = html;
    blog.createdAt = new Date();
    await blog.save();
    res.send(blog);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/", auth.verifyToken, User.verify, async (req, res) => {
  const { userId, title, delta, html } = req.body;
  const blog = new Blog({
    userId,
    title,
    delta,
    html,
    createdAt: new Date()
  });
  try {
    await blog.save();
    res.send(blog);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.delete("/", auth.verifyToken, User.verify, async (req, res) => {
  const { id } = req.body;
  const blog = await Blog.findOne({ _id: id });
  try {
    blog.delete();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = {
  model: Blog,
  routes: router
};
