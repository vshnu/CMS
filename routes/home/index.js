const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.all('/*', (req, res, next)=>{

    req.app.locals.layout = 'home';
    next();

});

router.get('/', (req, res) =>{

//    req.session.first = 'first session';

//    if(req.session.first){

//     console.log(`we found ${req.session.first}`)
//    }



    Post.find({}).then(posts =>{

        Category.find({}).then(categories=>{
        res.render('home/index', {posts: posts, categories:categories}); 
       
       });
    });
});


router.get('/about', (req, res) =>{
    res.render('home/about');
});

router.get('/login', (req, res) =>{
    res.render('home/login');
});

//APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
  
  User.findOne({email: email}).then(user=>{
      if(!user) return done(null, false, {message: 'No user found'});

      bcrypt.compare(password, user.password, (err, matched)=>{
          if(err) return err;

          if(matched){
              return done(null, user);
          } else{
            return done(null, false, { message: 'Incorrect password' });
          }
      });
  });
}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user) {
         done(err, user);
    });
});

router.post('/login', (req, res, next) =>{
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


router.get('/logout', (req, res) =>{
    req.logOut();
    res.redirect('/login');
});

router.get('/register', (req, res) =>{
    res.render('home/register');
});



router.post('/register', (req, res) =>{
  let errors = [];
 
 const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
 });

  if(!req.body.firstName) {
      errors.push({message: 'please enter your first name'});
  }
  if(!req.body.lastName) {
    errors.push({message: 'please enter your last name'});
}
if(!req.body.email) {
    errors.push({message: 'please enter your email'});
}
if(!req.body.password) { 
    errors.push({message: 'please enter your password'});
}
if(!req.body.passwordConfirm) { 
    errors.push({message: 'please enter your password Confirm'});
}
if(req.body.password !== req.body.passwordConfirm) { 
    errors.push({message: 'password do not match'});
  
}

if(errors.length > 0) {
    res.render('home/register', {

        errors: errors,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
         
    })
} else{

    User.findOne({email: req.body.email}).then(user=>{
       if(!user) {

        const newUser = new User({
        
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
        });
    
        bcrypt.genSalt(10, (err, salt)=>{
             bcrypt.hash(newUser.password, salt, (err, hash)=>{
                 
                 newUser.password = hash;
           
                 newUser.save().then(savwdUser=>{
           
                    req.flash('success_message', 'You are registererd');
                    res.redirect ('/login');
               });
            })
        });
    
       } else {
           req.flash('error_message', 'email exists')
           res.redirect ('/login');
       }
    });


   
   }
});

router.get('/post/:id', (req, res) =>{

  Post.findOne({_id: req.params.id}).populate({path: 'comments', populate: {path: 'user', model: 'users'}})

  .then(post =>{

    Category.find({}).then(categories=>{
        res.render('home/post', {post: post, categories: categories});
    });
       
   
  });

});


module.exports = router;

function newFunction(res) {
    res.send('home/register');
}
