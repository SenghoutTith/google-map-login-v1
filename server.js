const express = require('express');
const dotenv = require('dotenv').config()
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const OAuth2Strategy = require('passport-google-oauth2').Strategy;
const cookieSession = require('cookie-session')

const port = 8000
const connectDB = require('./db/connectDB')
const User = require('./model/userSchema')
const passportSetup = require('./passport')
const authRoute = require('./route/auth')

// App
const app = express();

// Connect to DB
connectDB()

// Middleware
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods:"GET,POST,PUT,DELETE",
}))

// Setup Session
app.use(session({
    secret: "hellosenghoutcute",
    resave: false,
    saveUninitialized: true,
}))

// app.use(cookieSession({
//     name: 'session',
//     keys: ['hellosenhoutcute'],
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }))

// Setup Passport
app.use(passport.initialize())
app.use(passport.session())

passport.use(
    new OAuth2Strategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"],
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log("profile", profile);
        try {
            const user = await User.findOne({ googleId: profile.id })
            if (user) {
                done(null, user)
            } else {
                const newUser = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.email,
                    image: profile.picture,
                })

                await newUser.save()

                done(null, newUser)
            }
        } catch (error) {
            return done(error, null)
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

// Initial Google OAuth Login
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Callback Google OAuth Login
app.use('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/',
    successRedirect: 'http://localhost:5173/admin/dashboard',
}))

app.get('/user/profile', (req, res) => {
    res.status(200).json(req.user)
})

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Start Server
app.listen(port, () => console.log(`Server up and running on port ${port}`))