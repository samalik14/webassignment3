
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _Shaheid Amin Malik________ Student ID: _152600201_____________ Date: _16/10/2022______________
*
*  Online (Cyclic) Link: https://gray-combative-coyote.cyclic.app
*
********************************************************************************/ 



var productService = require('./product-service.js')
var express = require("express")
var app = express()
var HTTP_PORT = process.env.PORT || 8080
var path = require("path")
	const multer = require("multer");
	const cloudinary = require('cloudinary').v2
	const streamifier = require('streamifier')

app.use('/public', express.static(path.join(__dirname, "public")));


cloudinary.config({
  cloud_name: 'dwftgenrj',
  api_key: '637162847459117',
  api_secret: 'YAhqXGqtW7Ndq_N6xYAI-aOwfQM',
  secure: true
});
const upload = multer(); 

function onHttpstart() {
  console.log("Express http server listening on port: " + HTTP_PORT)
}
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
})


app.get("/Products", (req, res)=> {
  productService.getPublishedProducts()
  .then((data)=>{
    res.json({data})
  })

  .catch((err)=>{
    res.json({message: err})
  })
})

app.get("/Demos", (req,res)=>{
  if (req.query.category) {
   productService.getAllProducts()
   .then((data)=>{
     res.json({data})
   })

   .catch((err)=>{
     res.json({message: err})
   })
  }

   else if (req.query.minDateStr) {
    productService.getProductsByMinDate(req.query.minDateStr)
      .then((data) => {
        res.json({ data })
      })

      .catch((err) => {
        res.json({ message: err })
      })
  }

  else {
    productService.getAllProducts()
      .then((data) => {
        res.json({ data })
      })

      .catch((err) => {
        res.json({ message: err })
      })
  }

})

app.get("/Categories", (req,res)=>{
  productService.getCategories()
  .then((data)=>{
    res.json({data})
  })
  .catch((err)=>{
    res.json({message: err})
  })
})

app.get("/products/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addProducts.html"));
})

app.post("/products/add",upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processProduct(uploaded.url);
    });
   } else {
    processProduct("");
   }

   function processProduct(imageUrl) {
    req.body.featureImage = imageUrl;
    console.log(req.body)
    productService.addProduct(req.body).then(() => {
      res.redirect('/products');
    })

  }

})

app.get('/products/:id', (req, res) => {
  productService.getproductById(req.params.id).then((data) => {
    res.json(data)
  })
    .catch((err) => {
      res.json({ message: err });
    })
})

app.use((req, res)=>{
  res.status(404).sendFile(path.join(__dirname, "/views/error.html"))
})

productService.initialize()
.then(()=>{
  app.listen(HTTP_PORT, ()=>{
    console.log(`Express http server listening on ${HTTP_PORT}`)
  })
})

.catch(() => {
  console.log("Failesd promises")
})