const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const categorySchema = new Schema(
  {
    categoryName: { type: String, unique: true, required: true, lowercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// index for location
categorySchema.index({ location: "2dsphere" });

// add pagination plugin
categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);

const categoryModel = model("category", categorySchema);

exports.createCategoryQuery = (obj) => categoryModel.create(obj);

//get all Vibes
exports.getCategory = (query) => categoryModel.find(query);



