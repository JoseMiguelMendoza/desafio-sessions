import { Router } from 'express'
import userModel from '../dao/models/user.model.js'
import { createHash, isValidPassword } from "../utils.js";

const router = Router()

router.post('/register', async(req, res) => {
    const userNew = {
        name: req.body.creatingName,
        surname: req.body.creatingSurname,
        age: req.body.creatingAge,
        email: req.body.creatingEmail,
        password: createHash(req.body.creatingPassword)
    }

    if(userNew.email === 'adminCoder@coder.com'){
        userNew.role = 'Administrador/a'
    } else{
        userNew.role = 'Usuario/a'
    }
    
    const user = new userModel(userNew)
    await user.save()
    res.redirect('/login')
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({email}).lean().exec()
    if(!user) {
        return res.render('userError', {
            error: 'User not found, please re-try.',
            statusCode: 401,
            user: false
        })
    }
    if (!isValidPassword(user, password)) {
        return res.render('userError', { 
            statusCode: 403, 
            error: 'Incorrect password, please re-try.',
            user: false
        })
    }
    req.session.user = user
    res.redirect('/products')
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.redirect('/userError')
        } else res.redirect('/login')
    })
})

export default router