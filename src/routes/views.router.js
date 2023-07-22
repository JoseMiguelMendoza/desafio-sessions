import { Router } from 'express'
import ProductManager from '../dao/mongo/productManager.js'
import cartModel from '../dao/models/cart.model.js'

const viewsRouter = Router()
const productManager = new ProductManager()

const auth = (req, res, next) => {
    if(req.session?.user && req.session.user.email === 'adminCoder@coder.com' && req.session.user.role === "Administrador/a") {
        return next()
    }
    return res.render('userError', {
        statusCode: 403,
        error: 'Only avaiable for Administrators.',
        user: req.session.user ? true : false
    })
}

const auth2 = (req, res, next) => {
    if(req.session?.user) {
        return next()
    }
    return res.render('userError', {
        statusCode: 403,
        error: 'You must create a user or sign in.',
        user: req.session.user ? true : false
    })
}


viewsRouter.get('/', auth , async(req, res) => {
    let result = await productManager.getProducts()
    res.render('home', {
        title: "Programación backEnd | Handlebars",
        products: result
    })
})

viewsRouter.get('/realTimeProducts', auth2, auth , async(req, res) => {
    res.render('realTimeProducts', {
        title: "Handlebars | Websocket",
        products: await productManager.getProducts(),
        name: req.session.user.name,
        role: req.session.user.role,
        checkingRole: req.session.user.role === 'Administrador/a' ? true : false
    })
})

viewsRouter.get('/products', auth2, async(req, res) => {
    const result = await productManager.getProductsWithFilters(req)
    res.render('products', {
        title: 'Paginate | Handlebars',
        products: result.response.payload,
        paginateInfo : {
            hasPrevPage: result.response.hasPrevPage,
            hasNextPage: result.response.hasNextPage,
            prevLink: result.response.prevLink,
            nextLink: result.response.nextLink
        },
        name: req.session.user.name,
        role: req.session.user.role,
        checkingRole: req.session.user.role === 'Administrador/a' ? true : false
    })
})

viewsRouter.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login - Iniciar sesión'
    })
})

viewsRouter.get('/register', (req, res) => {
    res.render('register', {
        title: 'Registrarse'
    })
})

viewsRouter.get('/userError', (req, res) => {
    res.render('userError', {
        title: 'Error',
        error: 'Do not enter this link.',
        user: req.session.user ? true : false
    })
})

viewsRouter.get('/carts/:cid', auth2, async(req, res) =>{
    try{
        let cid = req.params.cid
        let cartById = await cartModel.findById(cid).populate('products.product').lean()
        if(cartById === null){
            return res.status(404).json({ status: 'error', error: 'Not Found'})
        }
        res.render('cart', {
            title: 'Carrito',
            cid: cartById._id,
            products: cartById.products,
            name: req.session.user.name,
            role: req.session.user.role,
            checkingRole: req.session.user.role === 'Administrador/a' ? true : false
        })
    }catch(err){
        res.status(500).json({ status: 'error', error: err.message })
    }
})

export default viewsRouter