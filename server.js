var express = require("express");

var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static("public"));


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeArticles";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
axios.get("http://www.collegehumor.com/articles").then(function(response) {
    
    var $ = cheerio.load(response.data);

    
    $("a.listing-section__list-item-link").each(function(i, element) {
      
      var result = {};
      result.title = $(this).children("img").attr("alt");
      result.link = $(this).attr("href");

      
      db.Article.create(result)
        .then(function(dbArticle) {
          
          console.log(dbArticle);
          res.json(dbArticle);
        })
        .catch(function(err) {
          
          return res.json(err);
        });
    });
    
  });
});

app.get("/articles", function(req, res){
    db.Article.find({saved:false}).then(function(data){
        res.json(data);
    });
});

app.put("/save/:id", function(req, res){
    db.Article.updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {saved: true}}).then(function(data){
        res.json(data); 
    });
});


app.put("/unsave/:id", function(req, res){
    db.Article.updateOne({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {saved: false}}).then(function(data){
        res.json(data); 
    });
});


app.get("/articles/saved", function(req, res){
    db.Article.find({saved: true})
    .populate("notes")
    .then(function(data){
        res.json(data);
    });
});

app.get("/articles/saved/:id", function(req, res){
    db.Article.findOne({_id: mongoose.Types.ObjectId(req.params.id)})
    .populate("notes")
    .then(function(data){
        res.json(data);
    });
});



app.post("/new-note/:id", function(req, res){
    db.Note.create(req.body)
    .then(function(newNote){
        return db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: newNote._id}}, { new: true }).then(function(data){
            res.json(data);
        });
    });
});

app.delete("/note/remove/:id", function(req, res){
    db.Note.remove({_id: mongoose.Types.ObjectId(req.params.id)}).then(function(data){
        res.json(data);
    })
})

app.delete("/articles/clear", function(req, res){
    db.Article.remove({}).then(function(data){
        res.json(data);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });