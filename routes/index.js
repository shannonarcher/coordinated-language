var express = require('express');
var generate = require('project-name-generator');
var Cookies = require('cookies');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const cookies = new Cookies(req, res);
  let pastProjects = getPastProjects(cookies);
  const favourites = getFavourites(cookies);
  const [adjectiveLocked, nounLocked] = getLocks(cookies);

  const isRedirect = getRedirect(cookies);
  setCookie('redirect', false, cookies);

  let project;
  if (!isRedirect) {
    project = generate().dashed;
    const [adjective, noun] = project.split('-');
    project = `${adjectiveLocked || adjective}-${nounLocked || noun}`;

    setCookie(
      'past-projects', 
      [
        project,
        ...pastProjects,
      ].slice(0, 11),
      cookies
    );
  } else {
    project = pastProjects[0];
    pastProjects = pastProjects.slice(1);
  }

  pastProjects = pastProjects.slice(0, 10);

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

  const [adjective, noun] = project.split('-');

  res.render('index', {
    title: 'Heroku-style Project Name Generation',
    project,
    adjective,
    adjectiveLocked,
    noun,
    nounLocked,
    projects,
  });
});

router.post('/favourite/', function(req, res) {
  const { project } = req.body;
  
  const cookies = new Cookies(req, res);
  const favourites = getFavourites(cookies);

  setCookie(
    'favourites',
    [
      ...favourites,
      project,
    ],
    cookies,
  );
  setCookie('redirect', true, cookies);
  
  res.redirect('/');
});

router.post('/unfavourite/', function(req, res) {
  const { project } = req.body;
  
  const cookies = new Cookies(req, res);
  const favourites = getFavourites(cookies);

  setCookie('favourites', favourites.filter((name) => name !== project), cookies);
  setCookie('redirect', true, cookies);
  
  res.redirect('/');
});

router.post('/toggle-lock/:type/:word', function(req, res) {
  const { type, word } = req.params;
  const cookies = new Cookies(req, res);
  const [adjectiveLocked, nounLocked] = getLocks(cookies);

  setCookie('locks', [
    type === 'adjective' && !adjectiveLocked ? word : '',
    type === 'noun' && !nounLocked ? word : '',
  ], cookies);
  setCookie('redirect', true, cookies);

  res.redirect('/');
});

const getPastProjects = partialize(getCookie, 'past-projects', []);
const getFavourites = partialize(getCookie, 'favourites', []);
const getLocks = partialize(getCookie, 'locks', ['', '']);
const getRedirect = partialize(getCookie, 'redirect', false);

function partialize(fn, ...args) {
  return (...otherArgs) => fn(...args, ...otherArgs);
}

function getCookie(name, defaultValue, cookies) {
  try {
    return JSON.parse(cookies.get(name));
  } catch {};
  return defaultValue;
}

function setCookie(name, value, cookies) {
  console.log(name, value);
  cookies.set(name, JSON.stringify(value));
}

module.exports = router;
