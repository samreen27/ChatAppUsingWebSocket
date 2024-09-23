const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
}, {timestamps: true})

UserSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

})

UserSchema.methods.createJWT = function(){
    return jwt.sign({userId: this._id, name: this.name},process.env.JWT_SECRET,{expiresIn: process.env.JWT_LIFETIME})
}
UserSchema.methods.comparePassword = async function(password){
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}



module.exports =   mongoose.models.User || mongoose.model("User", UserSchema)