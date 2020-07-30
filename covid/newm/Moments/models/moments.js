var mongoose=require("mongoose");

var momentsSchema= new mongoose.Schema({
	created:{type:Date,default:Date.now},
	title: String,
  photopath: String,
	body: String,
		postlat: {
        type: Number
    },
	email: String,
    postlng: {
        type: Number
    },
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectID,
			ref:"user"
		},
		username:String
	},
	comments:[
		{
			type: mongoose.Schema.Types.ObjectID,
			ref:"Comment"
		}
	]
	
});
module.exports=mongoose.model("moments",momentsSchema);
