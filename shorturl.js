const express = require('express');
const app = express();
const fs = require('fs');

function geturls() {
    try {
        const data = fs.readFileSync('./data/shorturl.json');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing JSON:', error);
        return [];  
    }
}

function generateShortURL() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortURL = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortURL += characters[randomIndex];
    }
    return shortURL;
}

app.use(express.json());

app.get('/about', (req, res) => {
    res.send('This is the About page!');
});

app.post('/', (req, res) => {
    const urls = geturls();  

    const anse = urls.find(m => m.originalurl.toLowerCase() === req.body.originalurl.toLowerCase());

    if (anse) {
        res.send(anse.shorturl);
    } else {
        const newid = urls.length > 0 ? urls[urls.length - 1].id + 1 : 1;
        const newshort = generateShortURL();

        const newurl = {
            id: newid,
            shorturl: newshort,
            count: 0,  
            originalurl: req.body.originalurl
        };

        urls.push(newurl);

        fs.writeFile('./data/shorturl.json', JSON.stringify(urls, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving data');
            }

            res.send(newshort); 
        });
    }
});

app.get('/:shorturl', (req, res) => {
    const short = req.params.shorturl.trim();  
    const urls = geturls();  

    const ans = urls.find(m => m.shorturl.toLowerCase() === short.toLowerCase());

    if (ans) {
        ans.count++;

        if (ans.count > 20) {
            res.send("Limit exceeded");
        } else if (ans.count === 10) {
            fs.writeFileSync('./data/shorturl.json', JSON.stringify(urls, null, 2)); 
            res.redirect('https://www.google.com');  
        } else {
            fs.writeFileSync('./data/shorturl.json', JSON.stringify(urls, null, 2));
            res.redirect(ans.originalurl);  
        }
    } else {
        res.status(404).send('ERROR: 404 - Short URL not found');
    }
});

app.get('/details/:url', (req, res) => {
    const url = req.params.url.trim();  
    const urls = geturls();  

    let ans;
    if (url.length > 6) {
        ans = urls.find(m => m.originalurl.toLowerCase() === url.toLowerCase());
        if (ans) {
            res.send(ans.shorturl ? ans.shorturl : ans.count.toString());  
        } else {
            res.status(404).send('ERROR: Original URL not found');
        }
    } else {
        ans = urls.find(m => m.shorturl.toLowerCase() === url.toLowerCase());
        if (ans) {
            res.send(ans.count.toString());  
        } else {
            res.status(404).send('ERROR: Short URL not found');
        }
    }
});

app.get('/top/:number',(req,res)=>{
    const urls=geturls();
    let max=0;
    for (let i = 0; i < urls.length; i++) {
        if (max < urls[i].count) {
            max = urls[i].count;  
        }
    }

    res.send(max);

})

const port = 3000;
app.listen(port, () => {
    console.log('Server started on http://localhost:3000');
});