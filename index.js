require('dotenv').config()
const express = require('express')
// const morgan = require('morgan')
// const cors = require('cors')
const PhonebookEntry = require('./models/phonebook')

const app = express()

// morgan.token('body', (req) => {
//   return req.method === 'POST' ? JSON.stringify(req.body) : ''
// })

// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.static('dist'))
app.use(express.json())
// app.use(cors()
app.use(requestLogger)


function generateId() {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

function getInfo() {
    const date = new Date();
    date.getDate();

    return (
      PhonebookEntry
      .find({})
      .then(response => {
        console.log('response: ', response.length)
        lengthPersons = response.length
        
        const returnString = `
          <p>Phonebook has info for ${lengthPersons} people</p>
          <p>Info request on ${date}</p>
          `

        return returnString
      })
    )
}

app.get('/api/persons', (request, response) => {
    PhonebookEntry
      .find({})
      .then(notes => {
        response.json(notes)
      })
})

app.get('/api/info', (request, response) => {
    // console.log(request)

    const dummy = getInfo()

    dummy
      .then(info => {
        response.send(info)
      })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)

  PhonebookEntry
    .findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(() => {
      response.status(404).end()
    })
})

app.delete('/api/delete/:id', (request, response, next) => {

    PhonebookEntry
      .findByIdAndDelete(request.params.id)
      .then((result) => {
        response.status(204).end()
      })
      .catch((error) => next(error))

})

app.post('/api/add', (request, response, next) => {
    const body = request.body

    if (!body.number) {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }

    const entry = new PhonebookEntry({
        // id: generateId(),
        name: body.name,
        number: body.number
    })

    // persons = persons.concat(dummy)
   
    entry
      .save()
      .then(savedEntry => {
        response.json(savedEntry)
      })
      .catch(error => next(error))
})

app.put('/api/:id', (request, response, next) => {
  console.log('request.params.id: ', request.params.id)

  const { name, number } = request.body

  PhonebookEntry
    .findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    
      .catch((error) => next(error))

    })



})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})