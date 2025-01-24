const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const csvWriter = require('csv-write-stream');

const peopleFile = './data/people.csv';

// Helper function to read CSV data
const readPeopleData = () => {
  return new Promise((resolve, reject) => {
    const people = [];
    const stream = fs.createReadStream(peopleFile, 'utf8');
    const header = [];

    const rl = require('readline').createInterface({
      input: stream,
      output: process.stdout,
      terminal: false
    });

    let isHeader = true;

    rl.on('line', (line) => {
      if (isHeader) {
        // Extract the header line
        header.push(...line.split(','));
        isHeader = false;
      } else {
        // Extract the data lines
        const [id, name, age, email] = line.split(',');
        people.push({ id, name, age, email });
      }
    });

    rl.on('close', () => {
      resolve({ header, people });
    });

    rl.on('error', (error) => reject(error));
  });
};

// Helper function to write data back to the CSV
const writePeopleData = (header, people) => {
  const writer = csvWriter({ headers: header, sendHeaders: true });
  writer.pipe(fs.createWriteStream(peopleFile));

  people.forEach(person => {
    writer.write(person);
  });

  writer.end();
};

// Get all people
const getPeople = async (req, res) => {
  try {
    const { people } = await readPeopleData();
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve data', error });
  }
};

// Create a new person
const createPerson = async (req, res) => {
  const { name, age, email } = req.body;
  const newPerson = { id: uuidv4(), name, age, email };

  const { header, people } = await readPeopleData();
  people.push(newPerson); // Add the new person to the list of people

  // Write back the header and updated data
  writePeopleData(header, people);

  res.status(201).json(newPerson);
};

// Update an existing person
const updatePerson = async (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;

  const { header, people } = await readPeopleData();
  const personIndex = people.findIndex((p) => p.id === id);
  if (personIndex === -1) return res.status(404).json({ message: 'Person not found' });

  // Update the person data
  people[personIndex] = { id, name, age, email };

  // Write back the header and updated data
  writePeopleData(header, people);

  res.json(people[personIndex]);
};

// Delete a person
const deletePerson = async (req, res) => {
  const { id } = req.params;
  const { header, people } = await readPeopleData();
  const updatedPeople = people.filter((p) => p.id !== id);

  if (people.length === updatedPeople.length) return res.status(404).json({ message: 'Person not found' });

  // Write back the header and remaining data
  writePeopleData(header, updatedPeople);

  res.json({ message: 'Person deleted' });
};

module.exports = { getPeople, createPerson, updatePerson, deletePerson };
