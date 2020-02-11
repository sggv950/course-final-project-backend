const mongoService = require("./mongo.service");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  query,
  getById,
  remove,
  update,
  add
};

function query(filter = {}) {
  if (!filter.genre && !filter.instrument && !filter.name && !filter.status) {
      return mongoService.connectToDB()
        .then(dbConn => {
          const eventCollection = dbConn.collection('events');
          return eventCollection.find({}).toArray()
        })
  } else {
    const nameObject = { title: { $regex: `.*${filter.name}.*` } }

    var instrumentObject = {}
    if (filter.instrument.trim() && filter.instrument.trim() !== 'All instruments') {
      instrumentObject = { 'instruments.name': filter.instrument.trim() }
    }

    var genreObject = {}
    if (filter.genre && filter.genre !== 'All genres') genreObject = { genre: filter.genre }

    var statusObject = {}
    if (filter.status && filter.status !== 'All statuses') statusObject = { status: filter.status }

    var sortObject = {}
    if (filter.sortBy) sortObject = { [filter.sortBy]: parseInt(filter.order) }
    return mongoService.connectToDB()
      .then(dbConn => {
        const eventCollection = dbConn.collection('events')
        return eventCollection.find({ $and: [nameObject, genreObject, instrumentObject, statusObject] })
          .sort(sortObject)
          .toArray()
      })
  }
}

function add(event) {
  return mongoService.connectToDB().then(dbConn => {
    const eventCollection = dbConn.collection("events");
    return eventCollection.insertOne(event)
  });
}

function getById(eventId) {
  eventId = new ObjectId(eventId);
  return mongoService.connectToDB().then(dbConn => {
    const eventCollection = dbConn.collection("events");
    // return eventCollection.findOne({ _id: eventId });
    return eventCollection.aggregate([
      {$match: { _id: eventId }},
      {$lookup: {
        from: "players",
        localField: "adminId",
        foreignField: "_id",
        as: "admin"
      }},
      {$lookup: {
        from: "players",
        localField: "instruments.playerIds",
        foreignField: "_id",
        as: "players"
      }}
    ]).toArray();
  });
}

function remove(eventId) {
  eventId = new ObjectId(eventId);
  return mongoService.connectToDB().then(dbConn => {
    const eventCollection = dbConn.collection("events");
    return eventCollection.remove({ _id: eventId });
  });
}

function update(event) {
  const eventId = new ObjectId(event._id);
  delete event._id;
  
  event.instruments.forEach(instrument => {
    instrument.playerIds = instrument.playerIds.map((playerId) => ObjectId(playerId))
  })
  if (typeof event.adminId === 'string') event.adminId = ObjectId(event.adminId)
  return mongoService.connectToDB().then(dbConn => {
    const eventCollection = dbConn.collection("events");
    eventCollection.findOneAndUpdate({ _id: eventId }, { $set: event });
  });
}
