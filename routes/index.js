var express = require('express');
var generate = require('project-name-generator');
var Cookies = require('cookies');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const cookies = new Cookies(req, res);
  let pastProjects = getPastProjects(cookies);
  const favourites = getFavourites(cookies);

  const isRedirect = cookies.get('redirect');
  cookies.set('redirect', false);

  let project;
  if (!isRedirect) {
    project = generate().dashed;
    cookies.set('past-projects', JSON.stringify([
      project,
      ...pastProjects,
    ].slice(0, 10)));
  } else {
    project = pastProjects[0];
    pastProjects = pastProjects.slice(1, 10);
  }

  projects = [
    ...pastProjects.map((name) => ({
      name,
      isFavourite: favourites.includes(name),
    })),
    ...favourites
      .filter((name) => !pastProjects.includes(name))
      .map((name) => ({
        name,
        isFavourite: true,
      })),
  ];

  res.render('index', {
    title: 'Heroku-style Project Name Generation',
    project,
    projects,
  });
});

router.post('/favourite/', function(req, res) {
  const { project } = req.body;
  
  const cookies = new Cookies(req, res);
  const favourites = getFavourites(cookies);

  cookies.set('favourites', JSON.stringify([
    ...favourites,
    project,
  ]));  
  cookies.set('redirect', true);
  
  res.redirect('/');
});

router.post('/unfavourite/', function(req, res) {
  const { project } = req.body;
  
  const cookies = new Cookies(req, res);
  const favourites = getFavourites(cookies);

  cookies.set('favourites', JSON.stringify(
    favourites.filter((name) => name !== project),
  )); 
  console.log(favourites, project);
  cookies.set('redirect', true);
  
  res.redirect('/');
});

function getPastProjects(cookies) {
  try {
    return JSON.parse(cookies.get('past-projects'));
  } catch {
    return [];
  }
}

function getFavourites(cookies) {
  try {
    return JSON.parse(cookies.get('favourites'));
  } catch { }
  return [];
}

module.exports = router;
