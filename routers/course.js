const{CourseModel}=require("../db.js")
const {Router}=require("express")
const courseRouter=Router()

const {adminMiddleware}=require("../middlewares/admin.js")

// function AdminAuth(req,res,next){
//     const token=req.headers.admin_token
//     const DecodedInfo=jwt.verify(token,JWT_ADMIN_SECRET)
//     if(DecodedInfo){
//         req._id=DecodedInfo._id
//         next()
//     }
//     else{
//         res.json({
//             msg:"Invalid Token."
//         })
//     }
// }
    

courseRouter.post('/create',adminMiddleware,async (req,res)=>{
    const course=req.body.course
    const price=req.body.price
    const description=req.body.description
    const creatorId=req._id
    
   
    const foundCourse=await CourseModel.findOne({
        course:course
    })
    if(!foundCourse){
        await CourseModel.create({
        course:course,
        price:price,
        description:description,
        creatorId:creatorId
    })
    
    
    
    
    res.json({
        msg:"Course created successfully"
    })
}
    else {
        res.send(403).json({
            msg:"Course Already exists"
        })
    }
})
courseRouter.delete('/delete',adminMiddleware,async (req,res)=>{
    const course=req.body.course
    const creatorId=req._id
    const findCourseToBeDeleted=await CourseModel.findOne({
        course:course,
        creatorId:creatorId
    })
    if(findCourseToBeDeleted){
        await CourseModel.findByIdAndDelete(findCourseToBeDeleted._id)
   
        return res.json({
        msg:"Course deleted successfully"
    }) 
    }
     
    

    res.status(404).json({
        msg:"course does not exist"
    })




    
})
courseRouter.put('/update',adminMiddleware,async (req,res)=>{
    const creatorId=req._id
    const {course,price,description,courseId}=req.body

    // if _id==courseId and creatorId==req._id then only update the course

    try{
        const Updatedcourse=await CourseModel.updateOne({_id:courseId,
        creatorId:creatorId
    },{
        course:course,
        price:price,
        description:description,
      
    })
    res.json({
        msg:"course updated",
        courseId:Updatedcourse._id
    })
    console.log(Updatedcourse)
}
catch(e){
    res.status(403).json({
        msg:"some error occured"

    })
}

})



// exporting courseRouter
module.exports={
    courseRouter:courseRouter,
  
}
