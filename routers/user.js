// first create instance of a Router
const {Router}=require("express")
const userRouter=Router()
const {UserModel,CourseModel,PurchaseModel}=require("../db.js")
const jwt=require("jsonwebtoken")
// always keep diff pwd for user and admin
const JWT_USER_SECRET=process.env.JWT_USER_SECRET
const {userMiddleware}=require("../middlewares/user.js")



    userRouter.post('/signup',async (req,res)=>{
    const username=req.body.email
    const password=req.body.password
    const firstName=req.body.firstName
    const lastName=req.body.lastName
    // TODO: hash the password using bcrypt
    // TODO: add zod validation too
    // TODO: put inside a try catch block
    await UserModel.create({
        email:username,
        password:password,
        firstName:firstName,
        lastName:lastName
    })
    res.json({
        msg:"User added"
    })



})

userRouter.post('/signin',async (req,res)=>{
    const username=req.body.email
    const password=req.body.password

    // ideally password should be hashed and you can't compare 
    // the user provided password and the db password
    const User=await UserModel.findOne({
        email:username,
        password:password
    })
    if(User){
        const token=jwt.sign({
        _id:User._id.toString()
    },JWT_USER_SECRET)

    res.json({
        msg:"User Signed in",
        token:token
    })

    }
    else{
        res.send(403).json({
            msg:"Incorrect Credentials"
        })
    }
    
    
})

// auth for users
// function auth(req,res,next){
//     const token=req.headers.token
//     const DecodedInfo=jwt.verify(token,JWT_USER_SECRET)
//     if(DecodedInfo){
//         req._id=DecodedInfo._id
//         next()
//     }
//     else{
//         res.json({
//             msg:"Invalid token"
//         })
//     }
// }


userRouter.post('/purchase',userMiddleware,async (req,res)=>{
    //if user want to purchase course
    // should check if the user has paid the price or not
    const course=req.body.course
    const UserId=req._id
    const findCourse=await CourseModel.findOne({
        course:course
    })
    if(findCourse){
        await PurchaseModel.create({
        course:findCourse.course,
        courseId:findCourse._id.toString(),
        timeOfPurchase:new Date(),
        UserId:UserId
    })

    res.json({
        msg:"Successfully Purchased the Course"
    })
    } else {
        res.status(404).json({
            msg:"Course not found"
        })
    }
})
// a user don't need to authenticate to 
// see all the available courses
userRouter.get('/see',async (req,res)=>{
    // any user can see all the available courses
    const courses=await CourseModel.find({})
    res.json({
        courses:courses
    })
    
})
userRouter.get('/purchases',userMiddleware,async (req,res)=>{
    
    // user sees purchased courses

    const userId=req._id
    const purchases=await PurchaseModel.find({
        UserId:userId
    })
    let purchasedCourseIds=[]
    for(let i=0;i<purchases.length;i++){
        purchasedCourseIds.push(purchases[i].courseId)
    }
    const courseData=await CourseModel.find({
        // find ids whihch are in purchasedCourseIds
        _id:{$in:purchasedCourseIds}
    })
    res.json({
        purchases,
        courseData
    })

})


// exporting the userRouter
module.exports={
    userRouter:userRouter

}
    

