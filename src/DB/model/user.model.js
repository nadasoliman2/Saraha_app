  export const users =[]
  import mongoose from "mongoose"
  import { GenderEnum ,providerEnum,RoleEnum} from "../../common/enums/index.js"
  const  userSchema = new mongoose.Schema({
firstName:{
    type:String,
    required:true,
    minLength:[2,'firstname cannot be less than 2 char but you have entered a {VALUE}'],
    maxLength:25

},
 lastName:{
 
    minLength:[2,"lastname must be geater than  {VALUE}"],
    maxLength:25,
    type: String,
    required: [true,"lastName is Mandatory"]
},

 email:{type:String,required: true,unique: true},

 password:{
type:String,
required: function(){
  return this.provider === providerEnum.system
}
 },
phone:String,
confirmEmail:Date,
gender:{
    type:Number,
enum:Object.values(GenderEnum),
default:GenderEnum.Male
},
provider:{
    type:Number,
enum:Object.values(providerEnum),
default:providerEnum.system
},
changeCredentialsTime:Date,
coverProfilePicture:[String],
 profilePicture:String,
 otp: {
  type: String,
},
otpExpiry: {
  type: Date,
},
role:{
  type:Number,
  enum:Object.values(RoleEnum),
  default:RoleEnum.User
}

  },{
    collection:"Route_Users",
  timestamps:true,
  toJSON:{
    virtuals:true,
    transform:(doc,ret)=>{
      delete ret.firstName
      delete ret.lastName
      return ret
    }
  },
  toObject:{virtuals:true},
  optimisticConcurrency:true
  })
  userSchema.virtual("username").set(
    function(value){
const [firstName, lastName] = (value || "").split(" ")
        this.set({firstName,lastName})
    }
  ).get(
    function(){
        return this.firstName + " " + this.lastName
    }
  )
  export const UserModel = mongoose.models.User ||  mongoose.model("User",userSchema)
