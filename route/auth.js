const router = require('express').Router()
const passport = require('passport')

router.get(
    '/google/callback', 
    passport.authenticate('google', {
        successRedirect: 'http://localhost:5173/admin/dashboard',
        failureRedirect: '/login/failure',
        scope: ['profile', 'email']
    }
))

router.get('/login/failure', (req, res) => {
    res.status(401).json({
        error: true,
        message: "User failed to authenticate."
    })
})

router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "User has successfully authenticated.",
            user: req.user,
        })
    }else{
        res.status(401).json({
            error: true,
            message: "User not Authenticated."
        })
    }
})

router.get('/google', passport.authenticate('google', ['profile', 'email'] ))

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('http://localhost:5173/')
})

module.exports = router