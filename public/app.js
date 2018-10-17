$(function(){


$("#scrape").on("click", function(){
    $.get("/scrape", function(data){
        console.log(data);
        location.reload();
    });
});

$("#clear").on("click", function(){
    $.ajax({
        method: "DELETE",
        url: "/articles/clear"

    }).then(function(data){
        console.log("cleared");
        location.reload();
    });
});

$.get("/articles", function(data){
    data.forEach(element => {
        $(".articles").append(`
        <div><a href = "${element.link}"> ${element.title}</a> 
        
        <button class = "save" data-id = "${element._id}"> Save Article </button>
        </div>
        
        `)    
    });
    
    console.log(data);
});

$.get("/articles/saved", function(data){
    data.forEach(element => {
        $(".saved-articles").append(`
        <div><a href = "${element.link}"> ${element.title}</a> 
        
        <button class = "unsave" data-id = "${element._id}"> Remove From Saved </button>
        <button class = "notes" data-id = "${element._id}" data-toggle="modal" data-target="#notesModal"> Notes </button>
        </div>
        
        `)    
    });
    
    console.log(data);
});


$(document).on("click", ".save", function(){
    console.log("clicked");

    $.ajax({
        method: "PUT",
        url: "/save/" + $(this).data("id")
    }).then(function(data){
        console.log("saved");
        location.reload();
    });   
});

$(document).on("click", ".unsave", function(){
    $.ajax({
        method:"PUT",
        url:"/unsave/" + $(this).data("id")
    }).then(function(data){
        location.reload();
    });
});

$(document).on("click", ".notes", function(){
    $.get("/articles/saved/" + $(this).data("id"), function(data){
        console.log(data);
        $(".modal-title").html(`Notes for: <br>'${data.title}'`)
        $(".current-notes").empty();
        data.notes.forEach(element =>{
            $(".current-notes").append(`
            <div>${element.body} <button data-id ="${element._id}" class = "del-note" data-dismiss="modal">x</button></div>
            
            `)    
        });
        
    
        $("#note-submit").on("click", function(){
            var note = {body: $("#new-note").val()}
            $("#new-note").val("");
            console.log(note);
            $.ajax({
                method: "POST",
                url:"/new-note/" + data._id,
                data: note
            }).then(function(data){
                console.log("note added");
            });
        
        });

        $(document).on("click", ".del-note", function(){
            $.ajax({
                method:"DELETE",
                url: "/note/remove/" + $(this).data("id")
            }).then(function(){
                console.log("note deleted")
            })
        });

    });
});



















});