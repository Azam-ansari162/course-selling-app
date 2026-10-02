const {Router}=require("express")
const adminRouter=Router()
const {AdminModel}=require("../db.js")
const jwt=require("jsonwebtoken")
const JWT_ADMIN_SECRET=process.env.JWT_ADMIN_SECRET


adminRouter.post('/signup',async (req,res)=>{
    const username=req.body.email
    const password=req.body.password
    const firstName=req.body.firstName
    const lastName=req.body.lastName
    
    const newAdmin=await AdminModel.create({
        email:username,
        password:password,
        firstName:firstName,
        lastName:lastName
    })
    res.json({
        msg:"Admin created successfully",admin:newAdmin
    })
})
adminRouter.post('/signin',async (req,res)=>{
    const username=req.body.email
    const password=req.body.password
    
    const Admin=await AdminModel.findOne({
        email:username,
        password:password
    })
    
    if(Admin){
        const token=jwt.sign({
            _id:Admin._id.toString()
            
            
            },JWT_ADMIN_SECRET)

        res.json({
            msg:"Admin succesfully signed in",
            token:token
        })
    }
    else{
        res.status(403).json({
            msg:"Incorrect Credentials"
        })
    }


})

// exporting adminRouter

module.exports={
    adminRouter:adminRouter
}