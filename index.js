const axios =require ('axios');
const cheerio=require('cheerio');
const express=require('express');
const router=express.Router();


const url=`https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap`



 const scrapePage = (url) => {
    return axios.get(url).then((response) => {
      const $ = cheerio.load(response.data);
  
      // Extraer el título (h1)
      const title = $('h1').text().trim();

     
      // Extraer todas las imágenes ('img')
      const images = [];
      $('img').each((index,element) => {
        const img = $(element).attr('src');
        if (img) {
          images.push(img);
          
        }
      });

      // Extraer todos los párrafos ('p')
      const paragraphs = [];
      $('p').each((index,element) => {
        const text = $(element).text().trim();
        if (text) {
          paragraphs.push(text);
        }
      });

   return { title, images, paragraphs };
    
    
    }).catch((error) => {
      console.error(`Error scraping ${url}:`, error.message);
      return { error: `Failed to scrape ${url}` };
    });
  };
  

router.get('/',(req,res)=>{
    axios.get(url).then((response)=>{
      if (response.status===200){
 
       
      const htmlData= response.data;
      
      //Cheerio
      const $=cheerio.load(htmlData);
    
      const links =[];
       
  
       //buscamos los enlaces de la página  
      $('#mw-pages a').each((index,element)=>{
        const link=$(element).attr('href');
        links.push( `https://es.wikipedia.org${link}`);

    })
   

     const results = [];
     let promises = [];
 
     // Iterar sobre los enlaces y recolectar promesas
     links.forEach((link) => {
       promises.push(
        scrapePage(link).then((pageData) => {
           results.push(pageData);
         
         })
       );
     });

 
     // Resolver todas las promesas
     Promise.all(promises).then(() => {
      
    const literal=`<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Scraping</title>
    </head>
    <body>
        <h1>Información sobre músicos de rap</h1>
         ${results.map((pageData) => 
          `<div>
              <h2>Nombre: ${pageData.title}</h2>
              <h3>Imágenes</h3>
              <ul>
                  ${pageData.images.map(img => `<li><a href="${img}">${img}</a></li>`).join('')}
              </ul>
              <h3>Textos</h3>
              <ul>
                  ${pageData.paragraphs.map(text => `<li><div><a href="${text}">${text}</a></div></li>`).join('')}
              </ul>
          </div>`
        ).join('')}
        
              </body>
    </html>`
  res.send(literal);
     }).catch((error) => {
       console.error('Error :', error.message);
       res.status(500).json({ error: 'Failed to process the links.' });
     });
 

      }
    })
})


  module.exports=router;