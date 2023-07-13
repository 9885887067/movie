const express=require("express")

const app=express()
app.use(express.json())

const path=require("path")

const {open}=require("sqlite")

const sqlite3=require("sqlite3")

const dbPath=path.join(__dirname,moviesData.db)
let db=null
const initializedbAndSever=async()=>{
    try{
    db=await open(
        {
            fileName:dbPath,
            driver:sqlite3.Database,
        }
    )

    app.listen(3002,()=>{
        console.log("Server starting at http://localhost:3002/")
    })
    }
    catch(e){
        console.log(`db error is ${e.message}`)
        process.exit(1)
    }
}
initializedbAndSever()
convertToDbObjectToResponse=(dbObject)=>{

return {
    movieName:dbObject.movie_name
}
}


app.get("/movies/",async(request,response)=>{
    const getMoviesQuery='
        SELECT 
        movie_name 
        FROM 
        movie
        ORDER BY movie_id;
    ';
    const movieArray=await db.all(getMoviesQuery)
    response.send(movieArray.map((movie)=>
    convertToDbObjectToResponse(movie)
    )
    );
});



app.post("/movies/",(request,response)=>{
    const movieDetails=request.body
    const {
        directorId,
        movieName,
        leadActor
    }=movieDetails

    const addMovieQuery=`
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
    `;
    const dbResponse=await db.run(addMovieQuery)
    const movieId=dbResponse.lastID
    response.send("Movie Successfully Added")
})


app.get("/movies/:movieId/",async(request,response)=>{
    const {movieId}=request.params;
    const getMovieQuery=`
            SELECT * FROM
            movie
            WHERE movie_id=${movieId};
    `;
   const dbResp= await db.get(getMovieQuery)
   response.send(dbResp)

})


app.put("/movies/:movieId/",async(request,response)=>{
    const {movieId}=request.params
    const {
        directorId,
        movieName,
        leadActor
    }=movieDetails

    const updateQuery=`
        UPDATE 
        movie 
        SET 
        {movie_id}='${movieId}',
        {director_id}='${directorId}',
        {movie_name}='${movieName}',
        {lead_actor}='${lead_actor}'
        WHERE 
        movie_id=${movieId};
    `;

    await db.get(updateQuery)
    response.send("Movie Details Updated")
})


app.delete("/movies/:movieId/",async(request,response)=>{
    const {movieId}=request.params
    const deleteQuery=`
    DELETE FROM 
    movie
    WHERE movie_id=${movieId};
    `;
    await db.run(deleteQuery)
    response.send("Movie Removed")
})
const dbObjToResponse=(dbObject){
    return{
        directorId:dbObject.director_id,
        directorName:dbObject.director_name

    }
}


app.get("/directors/",async(request,response)=>{
    const getDirectorQuery=`
    SELECT * FROM 
    director;
    `;
    const getDirector=await db.all(getDirectorQuery)

    response.send(getDirector.map((eachDire)=>
    dbObjToResponse(eachDire)))
})

const convertDbObjToResponse=(dbObj)=>{
    return{
        movieName:dbObj.movie_name
    }
}

app.get("/directors/:directorId/movies/",async(request,response)=>{
    const {directorId}=request.params
    const getMovieQuery=`
        SELECT movie_name FROM 
        movie
        INNER JOIN director ON director_id=${directorId};  
    `;
    const movieName=await db.get(getMovieQuery)
    response.send(movieName.map((eachNmae)=>
    convertDbObjToResponse(eachName)))
})
module.exports=app