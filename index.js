require('dotenv').config()
const express=require("express")
const mongoose=require("mongoose")

const app=express()

const cors=require('cors')
app.use(cors())

app.use(express.json())

const {userRouter}=require("./routers/user.js")
const {courseRouter}=require("./routers/course.js")
const {adminRouter}=require("./routers/admin.js")
// mention the initial router here i.e in app.use("/initial_router")
// so that you don't need to 
// write it again and again in the endpoints

app.use("/users",userRouter)
app.use("/course",courseRouter)
app.use("/admin",adminRouter)




async function main() {
	mongoose.connect(process.env.MONGO_URI)
	app.listen(3000)
	console.log("listening on port 3000")
	
}
main()