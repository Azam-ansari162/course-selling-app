const jwt=require("jsonwebtoken")
const JWT_USER_SECRET=process.env.JWT_USER_SECRET
// auth for users

function userMiddleware(req,res,next){
    const token=req.headers.token
    const DecodedInfo=jwt.verify(token,JWT_USER_SECRET)
    if(DecodedInfo){
        req._id=DecodedInfo._id
        next()
    }
    else{
        res.json({
            msg:"Invalid token"
        })
    }
}
module.exports={
    userMiddleware:userMiddleware
}