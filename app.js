const express=require('express');
const app=express();
const PORT =3000;
const index=require('./index.js');



app.use('/',index);

app.listen(PORT,()=>{
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
})