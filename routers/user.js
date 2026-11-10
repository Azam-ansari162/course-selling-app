// first create instance of a Router
const {Router}=require("express")
const userRouter=Router()
const {UserModel,CourseModel,PurchaseModel}=require("../db.js")
const jwt=require("jsonwebtoken")
// always keep diff pwd for user and admin
const JWT_USER_SECRET=process.env.JWT_USER_SECRET
const {userMiddleware}=require("../middlewares/user.js")
const {GoogleGenAI}=require("@google/genai")
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})

// initializing razorpay
const Razorpay=require("razorpay")
const crypto=require("crypto")
const { countReset } = require("console")
const razorpay=new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// 1. Create an Order with Razorpay
userRouter.post('/create-order',userMiddleware,async (req,res)=>{
    const {courseId}=req.body
    const UserId=req._id
    if (!courseId) {
        return res.status(400).json({ msg: "courseId is required" });
    }
    try {
        const course=await CourseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ msg: "Course not found" });
        }
        const alreadyBought=await PurchaseModel.findOne({
            courseId:course._id,
            UserId:UserId
        })
        if (alreadyBought) {
            return res.status(400).json({ msg: "You have already purchased this course" });
        }
        // Registering an Order on Razorpay's server
        const options={
            amount:Math.round(course.price*100),
            currency:"INR",
            receipt:`rcpt_${Date.now()}`
        }

        // This calls Razorpay's API and creates the order on their servers.
        // Razorpay replies with an order object containing a unique order.id (looks like order_ODr4l6fUq90M7w).
        // Your frontend needs this order.id so the payment popup knows which order the user is paying for.
        const order=await razorpay.orders.create(options)
        res.json({
            
            orderId:order.id,
            amount:order.amount,
            currency:order.currency,
            keyId:process.env.RAZORPAY_KEY_ID,
            courseName:course.course,
            courseId:course._id
            
        
        })

    }
    catch(err){
        console.error("Order creation error:", err);
        res.status(500).json({ msg: "Failed to initiate payment" });
    }

})

// 2. Verify Payment Signature & Save Purchase in DB
userRouter.post('/verify-payment',userMiddleware,async (req,res)=>{
    // when user pays 
    // razorpay return 3 things 
    const razorpay_order_id = req.body.razorpay_order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature;
    
    const UserId=req._id

    const courseId=req.body.courseId
    // if any var is missing then there is some error
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
        return res.status(400).json({ msg: "Missing payment verification parameters" });
    }
    try{

    
    // Compute expected HMAC SHA-256 signature using your secret key
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ msg: "Invalid payment signature. Verification failed." });
    }
    const course=await CourseModel.findById(courseId)
    if (!course) {
        return res.status(404).json({ msg: "Course not found" });
    }
    // Check again to avoid duplicate entries
    const alreadyBought = await PurchaseModel.findOne({
        courseId: course._id,
        UserId:UserId
    });
    if (alreadyBought) {
        return res.status(400).json({ msg: "Course already purchased" });
    }

    await PurchaseModel.create({
        course:course.course,
        timeOfPurchase:new Date(),
        courseId:courseId,
        UserId:UserId,
        paymentId:razorpay_payment_id, // razorpay paymentId
        orderId:razorpay_order_id, //razorpay orderId
        amount:course.price //amount paid
    })
    res.json({ msg: "Payment verified and course purchased successfully!" });
    }
    catch(err){
        console.error("Payment verification error:", err);
        res.status(500).json({ msg: "Server error during payment verification" });
    }
})

userRouter.post('/chat',async(req,res)=>{
    try{
        const {message}=req.body
        if(!message) return res.status(403).json({msg:"Message is required"})
        const courses=await CourseModel.find({})
        const courseCatalog=courses.map((c)=>`-${c.course} (₹${c.price}): ${c.description}`).join('\n')
        const systemPrompt=`You are a helpful AI teaching assistant for an online course platform.
        Here are the courses currently available:
        ${courseCatalog || "No courses listed yet."}

        Answer student questions about which course to pick, explain concepts clearly, and keep responses under 100 words.`;
        const response=await ai.models.generateContent({
            model:"gemini-3.8-flash",
            contents: message,
            config: { systemInstruction: systemPrompt },
        })
        res.json({reply:response.text});

    }
    catch(err){
        console.error("Gemini Error:", err);
        res.status(500).json({ msg: "AI is temporarily unavailable." });
    }
})

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
        res.status(403).json({
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
    try{
        const findCourse=await CourseModel.findOne({
        course:course
    })
    const alreadyBought=await PurchaseModel.findOne({
        courseId:findCourse._id.toString(),
        UserId:UserId
    })
    if(alreadyBought){
        return res.status(400).json({
            msg:"You have already purchased this course"
        })
    }
    if(findCourse && !alreadyBought){
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
    }
    catch(err){
        console.error("Purchase error:",err)
        res.status(500).json({msg:"Server error during purchase"})
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
    

