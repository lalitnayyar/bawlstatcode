import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/save-response', (req, res) => {
    const { output } = req.body;
    if (!output) {
        console.error('No output provided');
        return res.status(400).send('No output provided');
    }
    const filePath = path.join(__dirname, 'output.md');
    fs.appendFileSync(filePath, output);
    res.status(200).send('Response saved');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
