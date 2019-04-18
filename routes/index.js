var express = require('express');
var generate = require('project-name-generator');
var Cookies = require('cookies');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const project = generate();

  const cookies = new Cookies(req, res);

  let pastProjects;
  try {
    pastProjects = JSON.parse(cookies.get('past-projects'));
  } catch {
    pastProjects = [];
  }

  cookies.set('past-projects', JSON.stringify([
    project.dashed,
    ...pastProjects,
  ].slice(0, 11)));

  res.render('index', {
    title: 'Heroku-style Project Name Generation',
    project,
    pastProjects,
  });
});

module.exports = router;
