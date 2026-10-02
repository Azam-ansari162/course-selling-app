const mongoose=require("mongoose")
const Schema=mongoose.Schema
const ObjectId=mongoose.Schema.Types.ObjectId

const User=new Schema({
    email:{type:String,unique:true},
    password:String,
   
    firstName:String,
    lastName:String
})

const Admin=new Schema({
    email:{type:String,unique:true},
    password:String,
    firstName:String,
    lastName:String
})

const Course=new Schema({
    course:String,
    description:String,
    price:Number,
    creatorId:ObjectId

})
const Purchase=new Schema({
    course:String,
    timeOfPurchase:Date,
    courseId:ObjectId,
    UserId:ObjectId
})

const UserModel=mongoose.model('users',User)
const AdminModel=mongoose.model('admins',Admin)
const CourseModel=mongoose.model('courses',Course)
const PurchaseModel=mongoose.model('purchases',Purchase)

module.exports={
    UserModel:UserModel,
    AdminModel:AdminModel,
    CourseModel:CourseModel,
    PurchaseModel:PurchaseModel
}