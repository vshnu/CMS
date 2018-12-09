const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');


var session = require('express-session');
const flash = require('connect-flash');

//Body Parser

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.use(upload());

app.use(session({
    secret: 'thisiscoding123all',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Passport

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next)=>{

    res.locals.user = req.user || null;
 
    res.locals.success_message = req.flash('success_message');

    res.locals.error_message = req.flash('error_message');

    res.locals.form_errors = req.flash('form_errors');

    res.locals.error = req.flash('error');

    next();
});

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/cms', { useNewUrlParser: true }).then((db)=>{
	console.log('MongoDB connected');
}).catch(error=> console.log("error"));


app.use(express.static(path.join(__dirname, 'public')));

const {select, generateTime} = require('./helper/handlebars-helper');

app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select, generateTime: generateTime}}));
app.set('view engine', 'handlebars');

//load routes

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

// view routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.listen(3000, () => {
     console.log(`listening on port 3000`);
});