const express = require('express');
const cors = require('cors');
const peopleRoutes = require('./routes/peopleRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/people', peopleRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
