const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    min: [3, "Must be at least 3, got {VALUE}"],
    required: true,
  },
  description: {
    type: String,
    min: [3, "Must be at least 10, got {VALUE}"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [1, "Price must be a positive number"],
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be a positive number"],
  },

  productImgs: {
    type: [String],
    default: ["/uploads/clothes.jpg"],
    validate: {
      validator: function (value) {
        return value.length <= 4;
      },
      message: "You can upload a maximum of 4 product images.",
    },
  },

  productCover: {
    type: String,
    default: "/uploads/clothes.jpg",
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
