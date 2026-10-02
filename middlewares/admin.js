const jwt=require("jsonwebtoken")

const JWT_ADMIN_SECRET=process.env.JWT_ADMIN_SECRET
function adminMiddleware(req,res,next){
    const token=req.headers.admin_token
    const DecodedInfo=jwt.verify(token,JWT_ADMIN_SECRET)
    if(DecodedInfo){
        req._id=DecodedInfo._id
        next()
    }
    else{
        res.json({
            msg:"Invalid Token."
        })
    }
   
}

 module.exports={
        adminMiddleware:adminMiddleware
    }