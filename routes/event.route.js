"use strict";

const eventService = require("../services/event.service");
const session = require("express-session");
module.exports = addRoutes;

// function requiredAuth(req, res, next) {
//     const user = req.session.user;
//     if (user) return res.status(200).send('Not Allowed')
//     else next()
// }

function addRoutes(app) {
  app.get("/api/event", (req, res) => {
    const filter = req.query;
    eventService.query(filter)
      .then(events => res.json(events));
  });

  // add event and return it's id
  app.post("/api/event", (req, res) => {
    const event = req.body;
    eventService.add(event).then(result => {
      res.json({ eventId: result.insertedId });
    });
  });
  // get one event
  app.get("/api/event/:eventId", (req, res) => {
    const eventId = req.params.eventId;
    eventService.getById(eventId).then(event => {
      // event = event.toArray()
      res.json(event[0]);
    });
  });

  // TODO: add middleware to delete, update and add
  // delete event
  app.delete("/api/event/:eventId", (req, res) => {
    const eventId = req.params.eventId;
    eventService.remove(eventId).then(() => res.end());
  });

    // update event
    app.put('/api/event/:eventId', (req, res) => {
        const event = req.body;
        console.log(event.msgs)
        eventService.update(event)
        .then(event => res.json(event));
    })
    
    // add event
    app.post('/api/event', (req, res) => {
        const event = req.body;
        eventService.add(event)
            .then(event => res.json(event));
    })
}
