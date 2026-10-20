const jwt=require('jsonwebtoken')

const JWT_ADMIN_SECRET=process.env.JWT_ADMIN_SECRET
function adminMiddleware(req,res,next){
    // frontend is sending token and not admin_token
    const token=req.headers.token
    if(!token){
        return res.status(401).json({
            msg:"Access denied. No token provided."
        })
    }
    try{
        const decodedInfo=jwt.verify(token,JWT_ADMIN_SECRET)
        req._id=decodedInfo._id
        next()
    }
    catch(err){
        return res.status(403).json({
            msg:"Invalid or expired token."
        })

    }
    
   
}

 module.exports={
        adminMiddleware:adminMiddleware
    }